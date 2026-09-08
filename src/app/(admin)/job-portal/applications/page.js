'use client';

import React, { useState, useEffect, Suspense, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortal } from '../PortalContext';
import { toUserMessage } from '@/lib/job-api/errors';
import { getFilterableScreeningQuestions, matchesScreeningFilters } from '@/lib/job-api/mappers';
import { useConfirm } from '@/components/ConfirmProvider';
import PortalHeader from '../components/PortalHeader';
import ViewToggle from '../components/ViewToggle';
import FilterRail from '../components/FilterRail';
import PipelineBoard from '../components/PipelineBoard';
import CandidateTable from '../components/CandidateTable';
import ScreeningResponsesTable from '../components/ScreeningResponsesTable';
import EmptyState from '../components/EmptyState';

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
    applications: allApplications,
    applicationsTotal,
    jobs,
    PIPELINE_STATUSES,
    moveApplication,
    shortlistApplication,
    finalizeHirePipeline,
    loadAllApplications,
    loadJobById,
    mergeApplications,
  } = usePortal();

  const [selectedJob, setSelectedJob] = useState(jobParam || '__all');
  const [selectedStage, setSelectedStage] = useState('__all');
  const [searchQuery, setSearchQuery] = useState('');
  const [screeningFilters, setScreeningFilters] = useState({});
  const [numericFilters, setNumericFilters] = useState({});
  const [answerSortBy, setAnswerSortBy] = useState('');
  const [answerSortDir, setAnswerSortDir] = useState('desc');
  const [view, setView] = useState('board');
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState('');
  const [toastVariant, setToastVariant] = useState('error');
  const [serverAppsRaw, setServerAppsRaw] = useState(null);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);
  const [loadingJobDetail, setLoadingJobDetail] = useState(false);
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  const hasScreeningClientFilters =
    Object.keys(screeningFilters).length > 0 || Object.keys(numericFilters).length > 0;

  const serverApps = useMemo(() => {
    if (!serverAppsRaw) return null;
    let rows = serverAppsRaw;
    if (hasScreeningClientFilters) {
      rows = rows.filter((app) => matchesScreeningFilters(app, screeningFilters, numericFilters));
    }
    if (answerSortBy) {
      const dir = answerSortDir === 'asc' ? 1 : -1;
      rows = [...rows].sort((a, b) => {
        const av = Number(a.answers?.[answerSortBy]);
        const bv = Number(b.answers?.[answerSortBy]);
        const aMissing = !Number.isFinite(av);
        const bMissing = !Number.isFinite(bv);
        if (aMissing && bMissing) return 0;
        if (aMissing) return 1;
        if (bMissing) return -1;
        if (av !== bv) return (av - bv) * dir;
        const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return bTime - aTime;
      });
    }
    return rows;
  }, [
    serverAppsRaw,
    screeningFilters,
    numericFilters,
    hasScreeningClientFilters,
    answerSortBy,
    answerSortDir,
  ]);

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
    setNumericFilters({});
    setAnswerSortBy('');
    setAnswerSortDir('desc');
  }, [selectedJob]);

  const officialFilterableIds = useMemo(() => {
    const qs = selectedJobRecord?.screeningQuestions || [];
    return new Set(
      qs.filter((q) => q.filterable && q.type !== 'text').map((q) => q.id)
    );
  }, [selectedJobRecord]);

  const apiChoiceFilters = useMemo(() => {
    const out = {};
    for (const [qid, opts] of Object.entries(screeningFilters)) {
      if (officialFilterableIds.has(qid) && opts?.length) out[qid] = opts;
    }
    return out;
  }, [screeningFilters, officialFilterableIds]);

  const apiNumericFilters = useMemo(() => {
    const out = {};
    for (const [qid, range] of Object.entries(numericFilters)) {
      if (!officialFilterableIds.has(qid) || !range) continue;
      const active =
        (range.min !== '' && range.min != null) ||
        (range.max !== '' && range.max != null) ||
        (range.exact !== '' && range.exact != null);
      if (active) out[qid] = range;
    }
    return out;
  }, [numericFilters, officialFilterableIds]);

  const apiSortBy = useMemo(() => {
    if (!answerSortBy || !officialFilterableIds.has(answerSortBy)) return '';
    const q = (selectedJobRecord?.screeningQuestions || []).find((item) => item.id === answerSortBy);
    if (!q || q.type === 'multi') return '';
    return `answer_${answerSortBy}`;
  }, [answerSortBy, officialFilterableIds, selectedJobRecord]);

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
        const fallback = jobsRef.current.find((j) => j.id === selectedJob) || null;
        if (!cancelled) setSelectedJobDetail(fallback);
      })
      .finally(() => {
        if (!cancelled) setLoadingJobDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isReady, isAuthed, selectedJob, loadJobById]);

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
        const params = { job_id: selectedJob };
        if (selectedStage !== '__all') params.status = selectedStage;
        if (searchQuery.trim()) params.q = searchQuery.trim();
        if (Object.keys(apiChoiceFilters).length) {
          params.screeningFilters = apiChoiceFilters;
        }
        if (Object.keys(apiNumericFilters).length) {
          params.numericFilters = apiNumericFilters;
        }
        if (apiSortBy) {
          params.sort_by = apiSortBy;
          params.sort_dir = answerSortDir || 'desc';
        }
        const result = await loadAllApplications(params);
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
    }, searchQuery || Object.keys(apiChoiceFilters).length || Object.keys(apiNumericFilters).length ? 300 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    isReady,
    isAuthed,
    selectedJob,
    selectedStage,
    searchQuery,
    apiChoiceFilters,
    apiNumericFilters,
    apiSortBy,
    answerSortDir,
    loadAllApplications,
    mergeApplications,
  ]);

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
  }, [selectedJob, selectedStage, searchQuery, screeningFilters, numericFilters, answerSortBy, answerSortDir, view]);

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

  const patchServerApp = useCallback((application) => {
    if (selectedJob === '__all' || !application?.id) return;
    setServerAppsRaw((prev) => {
      if (!prev) return prev;
      return prev.map((a) => (a.id === application.id ? { ...a, ...application } : a));
    });
  }, [selectedJob]);

  const handleMove = useCallback(
    async (id, status) => {
      const app = filteredApps.find((a) => a.id === id);
      if (!app || app.status === status) return;

      if (status === 'hired') {
        const ok = await confirm({
          title: 'Hire candidate?',
          message:
            `${app.candidateName || 'This candidate'} will be marked as hired.\n\n` +
            'Other applicants stay in their current stages. The job stays open so you can hire more people if needed. No emails will be sent.',
          confirmText: 'Hire',
          cancelText: 'Cancel',
        });
        if (!ok) return;

        try {
          const result = await finalizeHirePipeline(app.id);
          if (selectedJob !== '__all') {
            try {
              const refreshed = await loadAllApplications({ job_id: selectedJob });
              setServerAppsRaw(refreshed.applications);
            } catch {
              patchServerApp(result.application);
            }
          }
          showToast('Candidate hired.', 'success');
        } catch (err) {
          showToast(toUserMessage(err));
        }
        return;
      }

      if (status === 'rejected') {
        const ok = await confirm({
          title: 'Reject candidate?',
          message: `${app.candidateName || 'This candidate'} will be marked as rejected. No email will be sent.`,
          confirmText: 'Reject',
          cancelText: 'Cancel',
          variant: 'danger',
        });
        if (!ok) return;
      }

      try {
        const updated = await moveApplication(id, status);
        patchServerApp(updated);
        if (status === 'shortlisted') {
          showToast('Shortlisted. Filter Stage → Shortlisted to review them.', 'success');
        }
      } catch (err) {
        showToast(toUserMessage(err));
      }
    },
    [
      filteredApps,
      moveApplication,
      finalizeHirePipeline,
      loadAllApplications,
      selectedJob,
      showToast,
      confirm,
      patchServerApp,
    ]
  );

  const handleShortlist = useCallback(
    async (id) => {
      const app = filteredApps.find((a) => a.id === id);
      if (!app || app.status === 'shortlisted') return;
      try {
        const updated = await shortlistApplication(id);
        patchServerApp(updated);
        showToast('Shortlisted. Filter Stage → Shortlisted to review them.', 'success');
      } catch (err) {
        showToast(toUserMessage(err));
      }
    },
    [filteredApps, shortlistApplication, patchServerApp, showToast]
  );

  const clearFilters = () => {
    setSelectedJob('__all');
    setSelectedStage('__all');
    setSearchQuery('');
    setScreeningFilters({});
    setNumericFilters({});
    setAnswerSortBy('');
    setAnswerSortDir('desc');
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
          numericFilters={numericFilters}
          onNumericFiltersChange={setNumericFilters}
          answerSortBy={answerSortBy}
          answerSortDir={answerSortDir}
          onAnswerSortChange={({ sortBy, sortDir }) => {
            setAnswerSortBy(sortBy || '');
            setAnswerSortDir(sortDir || 'desc');
          }}
          screeningFiltersLoading={loadingJobDetail}
          onClear={clearFilters}
        />

        <div className="ats-board-main">
          {loadingApps && filteredApps.length === 0 ? (
            <div className="ats-skeleton" />
          ) : filteredApps.length === 0 && !loadingApps ? (
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
              onShortlist={handleShortlist}
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
