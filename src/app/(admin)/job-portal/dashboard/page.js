'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePortal } from '../PortalContext';
import PortalHeader from '../components/PortalHeader';
import AtsStatCard from '../components/AtsStatCard';
import PipelineFunnel from '../components/PipelineFunnel';
import CandidateTable from '../components/CandidateTable';
import EmptyState from '../components/EmptyState';

export default function Dashboard() {
  const router = useRouter();
  const {
    isReady,
    isAuthed,
    jobs,
    applications,
    PIPELINE_STATUSES,
    PortalStages,
    loading,
    error,
    dashboardStats,
    newThisWeek,
    inInterview,
    getApplicantCount,
  } = usePortal();

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace('/job-portal/login');
    }
  }, [isReady, isAuthed, router]);

  const pubJobs = useMemo(
    () => jobs.filter((j) => j.status === 'published'),
    [jobs]
  );

  const stages = useMemo(
    () =>
      PIPELINE_STATUSES.map((k) => ({
        key: k,
        count: applications.filter((a) => a.status === k).length,
      })),
    [PIPELINE_STATUSES, applications]
  );

  const recentCandidates = useMemo(
    () =>
      [...applications]
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 8),
    [applications]
  );

  if (!isReady || !isAuthed) return null;

  const totalApps = dashboardStats?.total_applications ?? applications.length;
  const openJobs = dashboardStats?.open_jobs ?? pubJobs.length;

  return (
    <>
      <PortalHeader title="Dashboard" />

      {error ? <div className="ats-toast is-error">{error}</div> : null}

      {loading ? (
        <div className="ats-stat-grid is-loading">
          <div className="ats-skeleton ats-stat-skeleton" />
        </div>
      ) : (
        <div className="ats-stat-grid">
          <AtsStatCard label="Total applications" value={totalApps} href="/job-portal/applications" />
          <AtsStatCard label="Open jobs" value={openJobs} href="/job-portal/postings" />
          <AtsStatCard label="New this week" value={newThisWeek} />
          <AtsStatCard label="In interview" value={inInterview} href="/job-portal/applications" />
        </div>
      )}

      <section className="ats-panel" style={{ marginTop: '1.5rem' }}>
        <div className="ats-panel-head">
          <h2 className="ats-panel-title">Pipeline funnel</h2>
        </div>
        {loading ? (
          <div className="ats-skeleton" />
        ) : (
          <PipelineFunnel stages={stages} labels={PortalStages.labels} />
        )}
      </section>

      <section className="ats-panel" style={{ marginTop: '1.5rem' }}>
        <div className="ats-panel-head">
          <h2 className="ats-panel-title">Recent candidates</h2>
          <Link href="/job-portal/applications" className="ats-panel-link">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="ats-skeleton" />
        ) : recentCandidates.length === 0 ? (
          <EmptyState
            icon="users"
            title="No applications yet"
            description="Candidates will appear here once they apply to your jobs."
            action={
              <Link href="/job-portal/postings/edit" className="btn btn-primary btn-sm">
                Post a job
              </Link>
            }
          />
        ) : (
          <CandidateTable applications={recentCandidates} jobs={jobs} />
        )}
      </section>

      <section className="ats-panel" style={{ marginTop: '1.5rem' }}>
        <div className="ats-panel-head">
          <h2 className="ats-panel-title">Active jobs</h2>
          <Link href="/job-portal/postings" className="ats-panel-link">
            All jobs
          </Link>
        </div>
        {loading ? (
          <div className="ats-skeleton" />
        ) : pubJobs.length === 0 ? (
          <EmptyState
            icon="briefcase"
            title="No published jobs"
            description="Publish a job to start receiving applications."
            action={
              <Link href="/job-portal/postings/edit" className="btn btn-primary btn-sm">
                Post a job
              </Link>
            }
          />
        ) : (
          <div className="ats-table-shell">
            <div className="ats-table-wrap">
              <table className="ats-table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Location</th>
                    <th>Applicants</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pubJobs.slice(0, 6).map((job) => (
                    <tr
                      key={job.id}
                      onClick={() =>
                        router.push(`/job-portal/applications?job=${encodeURIComponent(job.id)}`)
                      }
                    >
                      <td><strong>{job.title}</strong></td>
                      <td>{job.location || '—'}</td>
                      <td>{getApplicantCount(job.id)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/job-portal/applications?job=${encodeURIComponent(job.id)}`}
                          className="btn btn-outline btn-sm"
                        >
                          View candidates
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
