'use client';

import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortal } from '../PortalContext';
import { toUserMessage } from '@/lib/job-api/errors';
import { getFilterableScreeningQuestions, matchesScreeningFilters } from '@/lib/job-api/mappers';
import { buildStatusEmailDefaults } from '@/lib/job-api/email-templates';
import { useConfirm } from '@/components/ConfirmProvider';
import PortalHeader from '../components/PortalHeader';
import ViewToggle from '../components/ViewToggle';
import FilterRail from '../components/FilterRail';
import PipelineBoard from '../components/PipelineBoard';
import CandidateTable from '../components/CandidateTable';
import ScreeningResponsesTable from '../components/ScreeningResponsesTable';
import EmptyState from '../components/EmptyState';
import StatusEmailModal from '../components/StatusEmailModal';

const PAGE_SIZE = 50;
const VIEW_KEY = 'ats-candidates-view';

function ApplicationsInbox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobParam = searchParams.get('job');
  const confirm = useConfirm();

  const {
    isReady,
    isAuthed,
    isPreview,
    applications: allApplications,
    applicationsTotal,
    jobs,
    PIPELINE_STATUSES,
    moveApplication,
    updateApplicationWithEmail,
    finalizeHirePipeline,
    countOtherOpenApplicants,
    loadApplications,
    loadJobById,
    mergeApplications,
  } = usePortal();

  const [selectedJob, setSelectedJob] = useState(jobParam || '__all');
  const [selectedStage, setSelectedStage] = useState('__all');
  const [searchQuery, setSearchQuery] = useState('');
  const [screeningFilters, setScreeningFilters] = useState({});
  const [view, setView] = useState('board');
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState('');
  const [toastVariant, setToastVariant] = useState('error');
  const [serverAppsRaw, setServerAppsRaw] = useState(null);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);
  const [loadingJobDetail, setLoadingJobDetail] = useState(false);
  const [statusModal, setStatusModal] = useState(null);
  const [statusModalError, setStatusModalError] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);

  const serverApps = useMemo(() => {
    if (!serverAppsRaw) return null;
    if (!Object.keys(screeningFilters).length) return serverAppsRaw;
    return serverAppsRaw.filter((app) => matchesScreeningFilters(app, screeningFilters));
  }, [serverAppsRaw, screeningFilters]);

  const selectedJobRecord = useMemo(
    () => selectedJobDetail || (selectedJob !== '__all' ? jobs.find((j) => j.id === selectedJob) : null),
    [selectedJobDetail, selectedJob, jobs]
  );

  const jobApplications = useMemo(() => {
    if (selectedJob === '__all') return [];
    if (serverAppsRaw) return serverAppsRaw;
    return allApplications.filter((a) => a.jobId === selectedJob);
  }, [selectedJob, serverAppsRaw, allApplications]);

  const filterableQuestions = useMemo(
    () => getFilterableScreeningQuestions(selectedJobRecord?.screeningQuestions, jobApplications),
    [selectedJobRecord, jobApplications]
  );

  useEffect(() => {
    if (jobParam) setSelectedJob(jobParam);
  }, [jobParam]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(VIEW_KEY);
      if (saved === 'list' || saved === 'board' || saved === 'responses') setView(saved);
    }
  }, []);

  useEffect(() => {
    if (view === 'responses' && selectedJob === '__all') {
      setView('board');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(VIEW_KEY, 'board');
      }
    }
  }, [view, selectedJob]);

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace('/job-portal/login');
    }
  }, [isReady, isAuthed, router]);

  useEffect(() => {
    setScreeningFilters({});
  }, [selectedJob]);

  useEffect(() => {
    if (!isReady || !isAuthed || selectedJob === '__all') {
      setSelectedJobDetail(null);
      setLoadingJobDetail(false);
      return undefined;
    }

    let cancelled = false;
    setLoadingJobDetail(true);
    loadJobById(selectedJob)
      .then((job) => {
        if (!cancelled) setSelectedJobDetail(job);
      })
      .catch(() => {
        const fallback = jobs.find((j) => j.id === selectedJob) || null;
        if (!cancelled) setSelectedJobDetail(fallback);
      })
      .finally(() => {
        if (!cancelled) setLoadingJobDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isReady, isAuthed, selectedJob, loadJobById, jobs]);

  useEffect(() => {
    if (!isReady || !isAuthed) return undefined;

    if (selectedJob === '__all') {
      setServerAppsRaw(null);
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoadingApps(true);
      try {
        // Never send answer_* to the API — it 400s when the question is not
        // marked filterable on the job. Screening chips filter client-side.
        const params = { job_id: selectedJob, limit: 500, offset: 0 };
        if (selectedStage !== '__all') params.status = selectedStage;
        if (searchQuery.trim()) params.q = searchQuery.trim();
        const result = await loadApplications(params);
        if (!cancelled) {
          const apps = result.applications || [];
          setServerAppsRaw(apps);
          mergeApplications(apps);
        }
      } catch (err) {
        if (!cancelled) {
          setToast(toUserMessage(err));
          setTimeout(() => setToast(''), 4000);
        }
      } finally {
        if (!cancelled) setLoadingApps(false);
      }
    }, searchQuery ? 300 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isReady, isAuthed, selectedJob, selectedStage, searchQuery, loadApplications, mergeApplications]);

  const visibleStages = useMemo(() => {
    if (selectedStage !== '__all') return [selectedStage];
    return PIPELINE_STATUSES;
  }, [selectedStage, PIPELINE_STATUSES]);

  const filteredApps = useMemo(() => {
    if (!isReady) return [];
    if (selectedJob !== '__all' && serverApps) return serverApps;

    return allApplications.filter((a) => {
      if (selectedJob !== '__all' && a.jobId !== selectedJob) return false;
      if (selectedStage !== '__all' && a.status !== selectedStage) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const email = a.email || '';
        const emailName = email ? String(email).split('@')[0] : '';
        const candName = a.candidateName || emailName || '';
        const em = (a.email || '').toLowerCase();
        const ph = (a.phone || '').toLowerCase();
        if (!candName.toLowerCase().includes(q) && !em.includes(q) && !ph.includes(q)) return false;
      }
      return true;
    });
  }, [isReady, allApplications, selectedJob, selectedStage, searchQuery, serverApps]);

  useEffect(() => {
    setPage(0);
  }, [selectedJob, selectedStage, searchQuery, screeningFilters, view]);

  const showToast = useCallback((message, variant = 'error') => {
    setToast(message);
    setToastVariant(variant);
    setTimeout(() => setToast(''), variant === 'warning' || variant === 'success' ? 7000 : 4000);
  }, []);

  const handleViewChange = (next) => {
    if (next === 'responses' && selectedJob === '__all') {
      showToast('Select a job to view screening responses.');
      return;
    }
    setView(next);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(VIEW_KEY, next);
    }
  };

  const paginatedApps = useMemo(() => {
    if (view === 'board' || view === 'responses') return filteredApps;
    const start = page * PAGE_SIZE;
    return filteredApps.slice(start, start + PAGE_SIZE);
  }, [filteredApps, page, view]);

  const totalCount = filteredApps.length;
  const totalPages = Math.ceil(filteredApps.length / PAGE_SIZE);
  const showPagination = view === 'list' && filteredApps.length > PAGE_SIZE;

  const responseQuestions = useMemo(() => {
    if (selectedJobRecord?.screeningQuestions?.length) {
      return selectedJobRecord.screeningQuestions;
    }
    return [];
  }, [selectedJobRecord]);

  const viewOptions = useMemo(
    () => [
      { id: 'board', label: 'Board' },
      { id: 'list', label: 'List' },
      {
        id: 'responses',
        label: 'Responses',
        disabled: selectedJob === '__all',
        title:
          selectedJob === '__all'
            ? 'Select a job to view screening responses'
            : 'Spreadsheet of all screening answers',
      },
    ],
    [selectedJob]
  );

  const handleMove = useCallback(
    async (id, status) => {
      const app = filteredApps.find((a) => a.id === id);
      if (!app || app.status === status) return;

      if (isPreview) {
        try {
          await moveApplication(id, status);
          if (selectedJob !== '__all' && serverAppsRaw) {
            setServerAppsRaw((prev) =>
              (prev || []).map((a) => (a.id === id ? { ...a, status } : a))
            );
          }
        } catch (err) {
          showToast(toUserMessage(err));
        }
        return;
      }

      if (status === 'hired') {
        const others = countOtherOpenApplicants(app.jobId, app.id);
        const ok = await confirm({
          title: 'Hire candidate?',
          message:
            `${app.candidateName || 'This candidate'} will be hired and emailed.\n\n` +
            (others > 0
              ? `All ${others} other applicant${others === 1 ? '' : 's'} for this job will be rejected and emailed a rejection.\n\n`
              : 'There are no other open applicants for this job.\n\n') +
            'This job posting will be closed.',
          confirmText: 'Hire & reject others',
          cancelText: 'Cancel',
        });
        if (!ok) return;
      }

      setStatusModalError('');
      const modalJob = jobs.find((j) => j.id === app.jobId) || selectedJobRecord;
      const defaults = buildStatusEmailDefaults(
        app,
        modalJob,
        app.companyName || 'Blvck Sapphire',
        status
      );
      setStatusModal({ app, targetStatus: status, ...defaults });
    },
    [
      filteredApps,
      isPreview,
      jobs,
      moveApplication,
      selectedJob,
      selectedJobRecord,
      serverAppsRaw,
      showToast,
      confirm,
      countOtherOpenApplicants,
    ]
  );

  const handleStatusEmailSubmit = async (payload) => {
    if (!statusModal?.app) return;
    const { app } = statusModal;
    setStatusSaving(true);
    setStatusModalError('');
    try {
      if (payload.status === 'hired') {
        const result = await finalizeHirePipeline(app.id, payload);
        if (selectedJob !== '__all') {
          // Refresh board from server after hire cascade
          try {
            const refreshed = await loadApplications({
              job_id: selectedJob,
              limit: 500,
              offset: 0,
            });
            setServerAppsRaw(refreshed.applications);
          } catch {
            setServerAppsRaw((prev) =>
              (prev || []).map((a) => {
                if (a.id === result.application.id) return { ...a, ...result.application };
                if (a.jobId === result.application.jobId && a.id !== result.application.id) {
                  return { ...a, status: 'rejected' };
                }
                return a;
              })
            );
          }
        }
        setStatusModal(null);
        const parts = [];
        if (result.emailWarning) parts.push(result.emailWarning);
        else parts.push('Candidate hired and emailed.');
        if (result.rejectedCount > 0) {
          parts.push(`Rejected all ${result.rejectedCount} other applicant(s).`);
        }
        if (result.leftoverCount > 0) {
          parts.push(`${result.leftoverCount} still not rejected — check the board.`);
        }
        if (result.rejectionEmailFailures > 0) {
          parts.push(`${result.rejectionEmailFailures} rejection email(s) failed.`);
        }
        if (result.rejectionFailures?.length) {
          parts.push(`Could not reject ${result.rejectionFailures.length} applicant(s).`);
        }
        if (result.jobClosed) parts.push('Job closed.');
        else if (result.jobCloseError) parts.push(`Job not closed: ${result.jobCloseError}`);
        const isWarning =
          !!result.emailWarning ||
          result.rejectionEmailFailures > 0 ||
          (result.rejectionFailures?.length || 0) > 0 ||
          (result.leftoverCount || 0) > 0 ||
          !!result.jobCloseError;
        showToast(parts.join(' '), isWarning ? 'warning' : 'success');
        return;
      }

      const { application, emailWarning } = await updateApplicationWithEmail(app.id, payload);
      if (selectedJob !== '__all' && serverAppsRaw) {
        setServerAppsRaw((prev) =>
          (prev || []).map((a) => (a.id === application.id ? { ...a, ...application } : a))
        );
      }
      setStatusModal(null);
      if (emailWarning) {
        showToast(emailWarning, 'warning');
      } else if (application.email) {
        showToast(`Status updated · email sent to ${application.email}`, 'success');
      }
    } catch (err) {
      setStatusModalError(toUserMessage(err, 'status-email'));
    } finally {
      setStatusSaving(false);
    }
  };

  const clearFilters = () => {
    setSelectedJob('__all');
    setSelectedStage('__all');
    setSearchQuery('');
    setScreeningFilters({});
  };

  if (!isReady || !isAuthed) return null;

  return (
    <>
      <PortalHeader
        title="Candidates"
        badge={totalCount || applicationsTotal || allApplications.length}
        action={<ViewToggle value={view} onChange={handleViewChange} options={viewOptions} />}
      />

      {toast ? (
        <div
          className={`ats-toast is-${
            toastVariant === 'success'
              ? 'success'
              : toastVariant === 'warning'
                ? 'warning'
                : 'error'
          }`}
        >
          {toast}
        </div>
      ) : null}

      <StatusEmailModal
        key={
          statusModal
            ? `${statusModal.app.id}-${statusModal.targetStatus}`
            : 'closed'
        }
        open={!!statusModal}
        application={statusModal?.app}
        initialFields={statusModal?.fields}
        interviewIso={statusModal?.interviewIso}
        targetStatus={statusModal?.targetStatus}
        onClose={() => {
          if (!statusSaving) setStatusModal(null);
        }}
        onSubmit={handleStatusEmailSubmit}
        submitting={statusSaving}
        error={statusModalError}
      />

      <div className="ats-board-layout">
        <FilterRail
          jobs={jobs}
          selectedJob={selectedJob}
          onJobChange={setSelectedJob}
          selectedStage={selectedStage}
          onStageChange={setSelectedStage}
          stages={PIPELINE_STATUSES}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          screeningQuestions={filterableQuestions}
          screeningFilters={screeningFilters}
          onScreeningFiltersChange={setScreeningFilters}
          screeningFiltersLoading={loadingJobDetail}
          onClear={clearFilters}
        />

        <div className="ats-board-main">
          {loadingApps ? (
            <div className="ats-skeleton" />
          ) : filteredApps.length === 0 ? (
            <EmptyState
              icon="search"
              title="No candidates match"
              description="Try adjusting your filters or post a job to attract applicants."
            />
          ) : view === 'board' ? (
            <PipelineBoard
              stages={visibleStages}
              applications={filteredApps}
              jobs={jobs}
              onMoveApplication={handleMove}
              onError={(err) => {
                setToast(toUserMessage(err));
                setTimeout(() => setToast(''), 4000);
              }}
            />
          ) : view === 'responses' ? (
            responseQuestions.length || filteredApps.some((a) => Object.keys(a.answers || {}).length) ? (
              <ScreeningResponsesTable
                applications={filteredApps}
                questions={responseQuestions}
                jobId={selectedJob !== '__all' ? selectedJob : undefined}
              />
            ) : (
              <EmptyState
                icon="search"
                title="No screening questions"
                description="Add screening questions to this job to collect sortable responses."
              />
            )
          ) : (
            <>
              <CandidateTable
                applications={paginatedApps}
                jobs={jobs}
                screeningQuestions={selectedJobRecord?.screeningQuestions}
              />
              {showPagination ? (
                <div className="ats-pagination">
                  <span>
                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredApps.length)} of{' '}
                    {filteredApps.length}
                  </span>
                  <div className="ats-pagination-btns">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function Applications() {
  return (
    <Suspense fallback={<div className="ats-skeleton" />}>
      <ApplicationsInbox />
    </Suspense>
  );
}
