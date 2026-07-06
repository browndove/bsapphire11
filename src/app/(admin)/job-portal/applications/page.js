'use client';

import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortal } from '../PortalContext';
import { toUserMessage } from '@/lib/job-api/errors';
import PortalHeader from '../components/PortalHeader';
import ViewToggle from '../components/ViewToggle';
import FilterRail from '../components/FilterRail';
import PipelineBoard from '../components/PipelineBoard';
import CandidateTable from '../components/CandidateTable';
import EmptyState from '../components/EmptyState';

const PAGE_SIZE = 50;
const VIEW_KEY = 'ats-candidates-view';

function ApplicationsInbox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobParam = searchParams.get('job');

  const {
    isReady,
    isAuthed,
    applications,
    applicationsTotal,
    jobs,
    PIPELINE_STATUSES,
    moveApplication,
  } = usePortal();

  const [selectedJob, setSelectedJob] = useState(jobParam || '__all');
  const [selectedStage, setSelectedStage] = useState('__all');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('board');
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (jobParam) setSelectedJob(jobParam);
  }, [jobParam]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(VIEW_KEY);
      if (saved === 'list' || saved === 'board') setView(saved);
    }
  }, []);

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace('/job-portal/login');
    }
  }, [isReady, isAuthed, router]);

  const handleViewChange = (next) => {
    setView(next);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(VIEW_KEY, next);
    }
  };

  const visibleStages = useMemo(() => {
    if (selectedStage !== '__all') return [selectedStage];
    return PIPELINE_STATUSES;
  }, [selectedStage, PIPELINE_STATUSES]);

  const filteredApps = useMemo(() => {
    if (!isReady) return [];
    return applications.filter((a) => {
      if (selectedJob !== '__all' && a.jobId !== selectedJob) return false;
      if (selectedStage !== '__all' && a.status !== selectedStage) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const email = a.email || a.candidate_email || '';
        const emailName = email ? String(email).split('@')[0] : '';
        const candName =
          a.candidateName ||
          [a.first_name, a.last_name].filter(Boolean).join(' ') ||
          [a.candidate_first_name, a.candidate_last_name].filter(Boolean).join(' ') ||
          (a.candidate && (a.candidate.first_name || a.candidate.last_name)
            ? [a.candidate.first_name, a.candidate.last_name].filter(Boolean).join(' ')
            : '') ||
          emailName ||
          '';
        const cand = candName.toLowerCase();
        const em = (a.email || '').toLowerCase();
        const ph = (a.phone || '').toLowerCase();
        if (!cand.includes(q) && !em.includes(q) && !ph.includes(q)) return false;
      }
      return true;
    });
  }, [isReady, applications, selectedJob, selectedStage, searchQuery]);

  useEffect(() => {
    setPage(0);
  }, [selectedJob, selectedStage, searchQuery, view]);

  const paginatedApps = useMemo(() => {
    if (view === 'board') return filteredApps;
    const start = page * PAGE_SIZE;
    return filteredApps.slice(start, start + PAGE_SIZE);
  }, [filteredApps, page, view]);

  const totalPages = Math.ceil(filteredApps.length / PAGE_SIZE);
  const showPagination = view === 'list' && filteredApps.length > PAGE_SIZE;

  const handleMove = useCallback(
    async (id, status) => {
      try {
        await moveApplication(id, status);
      } catch (err) {
        setToast(toUserMessage(err));
        setTimeout(() => setToast(''), 4000);
      }
    },
    [moveApplication]
  );

  const clearFilters = () => {
    setSelectedJob('__all');
    setSelectedStage('__all');
    setSearchQuery('');
  };

  if (!isReady || !isAuthed) return null;

  return (
    <>
      <PortalHeader
        title="Candidates"
        badge={applicationsTotal || applications.length}
        action={<ViewToggle value={view} onChange={handleViewChange} />}
      />

      {toast ? <div className="ats-toast is-error">{toast}</div> : null}

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
          onClear={clearFilters}
        />

        <div className="ats-board-main">
          {filteredApps.length === 0 ? (
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
          ) : (
            <>
              <CandidateTable applications={paginatedApps} jobs={jobs} />
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
