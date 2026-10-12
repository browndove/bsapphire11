'use client';

import React, { useState, useEffect, Suspense, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PortalStages, usePortal } from '../PortalContext';
import { toUserMessage } from '@/lib/job-api/errors';
import { isWithinDays } from '@/lib/job-api/format';
import { getFilterableScreeningQuestions, matchesScreeningFilters } from '@/lib/job-api/mappers';
import { applyEmailPlaceholders, buildEmailContext, buildStatusEmailDefaults } from '@/lib/job-api/email-templates';
import {
  readFilterRailCollapsed,
  readReview,
  readSelectedJob,
  writeFilterRailCollapsed,
  writeReview,
  writeReviewQueue,
  writeSelectedJob,
} from '@/lib/job-api/portal-ui';
import StatusEmailModal from '../components/StatusEmailModal';
import { useConfirm } from '@/components/ConfirmProvider';
import PortalHeader from '../components/PortalHeader';
import ViewToggle from '../components/ViewToggle';
import FilterRail from '../components/FilterRail';
import PipelineBoard from '../components/PipelineBoard';
import CandidateTable from '../components/CandidateTable';
import ScreeningResponsesTable from '../components/ScreeningResponsesTable';
import EmptyState from '../components/EmptyState';

const PAGE_SIZE = 20;
const BULK_STAGES = ['reviewing', 'shortlisted', 'interview', 'rejected', 'hired'];
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
    updateApplicationWithEmail,
    loadAllApplications,
    loadJobById,
    mergeApplications,
  } = usePortal();

  const [selectedJob, setSelectedJob] = useState(jobParam || '__all');
  const [selectedStage, setSelectedStage] = useState(searchParams.get('status') || '__all');
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
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [tableSort, setTableSort] = useState({ key: 'submittedAt', dir: 'desc' });
  const [undoMove, setUndoMove] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [statusModalError, setStatusModalError] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;
  const sinceDays = Number(searchParams.get('since') || '');

  useEffect(() => {
    setRailCollapsed(readFilterRailCollapsed());
    if (!jobParam) {
      const stored = readSelectedJob();
      if (stored) setSelectedJob(stored);
    }
  }, [jobParam]);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) setSelectedStage(status);
  }, [searchParams]);

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
    const withinWindow = (app) =>
      !Number.isFinite(sinceDays) || sinceDays <= 0 || isWithinDays(app.submittedAt, sinceDays);
    if (selectedJob !== '__all' && serverApps) {
      return serverApps.filter(withinWindow);
    }

    return allApplications.filter((a) => {
      if (!withinWindow(a)) return false;
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
  }, [isReady, allApplications, selectedJob, selectedStage, searchQuery, serverApps, sinceDays]);

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

  const sortedApps = useMemo(() => {
    const rows = [...filteredApps];
    const dir = tableSort.dir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      if (tableSort.key === 'name') {
        return String(a.candidateName || '').localeCompare(String(b.candidateName || '')) * dir;
      }
      if (tableSort.key === 'status') {
        return String(a.status || '').localeCompare(String(b.status || '')) * dir;
      }
      const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return (aTime - bTime) * dir;
    });
    return rows;
  }, [filteredApps, tableSort]);

  const paginatedApps = useMemo(() => {
    if (view === 'board' || view === 'responses') return sortedApps;
    const start = page * PAGE_SIZE;
    return sortedApps.slice(start, start + PAGE_SIZE);
  }, [sortedApps, page, view]);

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

      if (status === 'hired' || status === 'rejected') {
        const job = jobs.find((item) => item.id === app.jobId);
        const defaults = buildStatusEmailDefaults(app, job, app.companyName || 'Blvck Sapphire', status);
        setStatusModalError('');
        setStatusModal({
          apps: [app],
          targetStatus: status,
          ...defaults,
        });
        return;
      }

      try {
        const updated = await moveApplication(id, status);
        patchServerApp(updated);
        setUndoMove({ id, from: app.status, name: app.candidateName || 'Candidate', to: status });
        showToast(`Moved ${app.candidateName || 'candidate'} to ${status}.`, 'success');
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
      jobs,
    ]
  );

  const undoLastMove = async () => {
    if (!undoMove) return;
    try {
      const updated = await moveApplication(undoMove.id, undoMove.from);
      patchServerApp(updated);
      showToast('Move undone.', 'success');
    } catch (err) {
      showToast(toUserMessage(err));
    } finally {
      setUndoMove(null);
    }
  };

  const openBulkMove = (status) => {
    const apps = filteredApps.filter((app) => selectedIds.includes(app.id));
    if (!apps.length) return;
    const sample = {
      ...apps[0],
      firstName: '{{first_name}}',
      lastName: '{{last_name}}',
      candidateName: '{{first_name}}',
    };
    const job = jobs.find((item) => item.id === sample.jobId);
    const defaults = buildStatusEmailDefaults(sample, job, sample.companyName || 'Blvck Sapphire', status);
    setStatusModalError('');
    setStatusModal({ apps, targetStatus: status, ...defaults });
  };

  const handleBulkSubmit = async (payload) => {
    const apps = statusModal?.apps || [];
    setBulkSaving(true);
    setStatusModalError('');
    try {
      for (const app of apps) {
        const job = jobs.find((item) => item.id === app.jobId);
        const context = buildEmailContext(app, job, app.companyName || 'Blvck Sapphire', payload.interview_at);
        const nextPayload = payload.send_email === false
          ? payload
          : {
              ...payload,
              email_subject: applyEmailPlaceholders(payload.email_subject, context),
              email_body: applyEmailPlaceholders(payload.email_body, context),
              reminder_email_subject: applyEmailPlaceholders(payload.reminder_email_subject, context),
              reminder_email_body: applyEmailPlaceholders(payload.reminder_email_body, context),
            };
        if (payload.status === 'hired') {
          const result = await finalizeHirePipeline(app.id, nextPayload);
          patchServerApp(result.application);
        } else {
          const result = await updateApplicationWithEmail(app.id, nextPayload);
          patchServerApp(result.application);
        }
      }
      setStatusModal(null);
      setSelectedIds([]);
      showToast(`Updated ${apps.length} candidate${apps.length === 1 ? '' : 's'}.`, 'success');
    } catch (err) {
      setStatusModalError(toUserMessage(err, 'status-email'));
    } finally {
      setBulkSaving(false);
    }
  };

  const exportSelected = () => {
    const apps = filteredApps.filter((app) => selectedIds.includes(app.id));
    const lines = [
      ['Name', 'Email', 'Job', 'Stage', 'Applied'],
      ...apps.map((app) => [
        app.candidateName || '',
        app.email || '',
        app.jobTitle || '',
        app.status || '',
        app.submittedAt || '',
      ]),
    ];
    const csv = lines.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'candidates.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeFilterCount = [
    selectedJob !== '__all',
    selectedStage !== '__all',
    Boolean(searchQuery),
    Object.keys(screeningFilters).length > 0,
    Object.keys(numericFilters).length > 0,
    Number.isFinite(sinceDays) && sinceDays > 0,
  ].filter(Boolean).length;

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
    writeSelectedJob('__all');
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
          {undoMove ? (
            <button type="button" className="btn btn-outline btn-sm" onClick={undoLastMove}>
              Undo
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="ats-board-layout">
        <FilterRail
          collapsed={railCollapsed}
          activeFilterCount={activeFilterCount}
          onToggleCollapsed={() => {
            setRailCollapsed((current) => {
              writeFilterRailCollapsed(!current);
              return !current;
            });
          }}
          jobs={jobs}
          selectedJob={selectedJob}
          onJobChange={(value) => {
            setSelectedJob(value);
            writeSelectedJob(value);
          }}
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
              onBeforeOpen={() => writeReviewQueue(filteredApps.map((app) => app.id))}
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
                selectable
                selectedIds={selectedIds}
                sortKey={tableSort.key}
                sortDir={tableSort.dir}
                onSort={(key) => {
                  setTableSort((current) => ({
                    key,
                    dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc',
                  }));
                }}
                onToggleRow={(id) => {
                  setSelectedIds((current) =>
                    current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
                  );
                }}
                onToggleAll={(checked) => {
                  setSelectedIds(checked ? paginatedApps.map((app) => app.id) : []);
                }}
                onToggleShortlist={(app) => {
                  const review = readReview(app.id);
                  const tagged = review.tags?.includes('shortlisted');
                  writeReview(app.id, {
                    tags: tagged
                      ? review.tags.filter((tag) => tag !== 'shortlisted')
                      : [...(review.tags || []), 'shortlisted'],
                  });
                  if (!tagged && app.status !== 'shortlisted') handleShortlist(app.id);
                  setSelectedIds((current) => [...current]);
                }}
                onRowClick={() => writeReviewQueue(filteredApps.map((app) => app.id))}
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

      {selectedIds.length ? (
        <div className="ats-bulk-bar">
          <span className="ats-bulk-count">
            <strong>{selectedIds.length}</strong> selected
          </span>
          <div className="ats-bulk-move">
            <span>Move to</span>
            {BULK_STAGES.map((status) => (
              <button
                key={status}
                type="button"
                className={`ats-bulk-stage${status === 'rejected' ? ' is-danger' : ''}`}
                onClick={() => openBulkMove(status)}
              >
                {PortalStages.labels[status] || status}
              </button>
            ))}
          </div>
          <div className="ats-bulk-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => openBulkMove('interview')}>
              Email selected
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={exportSelected}>
              Export selected
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelectedIds([])}>
              Clear
            </button>
          </div>
        </div>
      ) : null}

      <StatusEmailModal
        open={!!statusModal}
        application={statusModal?.apps?.[0]}
        initialFields={statusModal?.fields}
        interviewIso={statusModal?.interviewIso}
        targetStatus={statusModal?.targetStatus}
        bulkCount={statusModal?.apps?.length || 1}
        onClose={() => {
          if (!bulkSaving) setStatusModal(null);
        }}
        onSubmit={handleBulkSubmit}
        submitting={bulkSaving}
        error={statusModalError}
      />
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
