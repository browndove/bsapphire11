'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePortal } from '../PortalContext';
import PortalHeader from '../components/PortalHeader';
import AtsStatCard from '../components/AtsStatCard';
import PipelineFunnel from '../components/PipelineFunnel';
import CandidateTable from '../components/CandidateTable';
import EmptyState from '../components/EmptyState';
import CustomSelect from '@/components/CustomSelect';

function isWithinDays(iso, days) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= days * 24 * 60 * 60 * 1000;
}

export default function Dashboard() {
  const router = useRouter();
  const {
    isReady,
    isAuthed,
    jobs,
    applications,
    applicationsTotal,
    PIPELINE_STATUSES,
    PortalStages,
    loading,
    error,
    dashboardStats,
    getApplicantCount,
  } = usePortal();

  const [selectedJob, setSelectedJob] = useState('__all');

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace('/job-portal/login');
    }
  }, [isReady, isAuthed, router]);

  const pubJobs = useMemo(
    () => jobs.filter((j) => j.status === 'published'),
    [jobs]
  );

  const jobOptions = useMemo(
    () => [
      { value: '__all', label: 'All jobs' },
      ...jobs.map((j) => ({
        value: j.id,
        label: `${j.title}${j.status && j.status !== 'published' ? ` (${j.status})` : ''}`,
      })),
    ],
    [jobs]
  );

  const scopedApps = useMemo(() => {
    if (selectedJob === '__all') return applications;
    return applications.filter((a) => a.jobId === selectedJob);
  }, [applications, selectedJob]);

  const stages = useMemo(
    () =>
      PIPELINE_STATUSES.map((k) => ({
        key: k,
        count: scopedApps.filter((a) => a.status === k).length,
      })),
    [PIPELINE_STATUSES, scopedApps]
  );

  const recentCandidates = useMemo(
    () =>
      [...scopedApps]
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 8),
    [scopedApps]
  );

  const newThisWeek = useMemo(
    () => scopedApps.filter((a) => isWithinDays(a.submittedAt, 7)).length,
    [scopedApps]
  );

  const inInterview = useMemo(
    () => scopedApps.filter((a) => a.status === 'interview').length,
    [scopedApps]
  );

  const visibleJobs = useMemo(() => {
    if (selectedJob === '__all') return pubJobs;
    return jobs.filter((j) => j.id === selectedJob);
  }, [jobs, pubJobs, selectedJob]);

  if (!isReady || !isAuthed) return null;

  const totalApps =
    selectedJob === '__all'
      ? Math.max(
          Number(dashboardStats?.total_applications) || 0,
          Number(applicationsTotal) || 0,
          applications.length
        )
      : getApplicantCount(selectedJob);

  const openJobs =
    selectedJob === '__all'
      ? dashboardStats?.open_jobs ?? pubJobs.length
      : jobs.find((j) => j.id === selectedJob)?.status === 'published'
        ? 1
        : 0;

  const applicationsHref =
    selectedJob === '__all'
      ? '/job-portal/applications'
      : `/job-portal/applications?job=${encodeURIComponent(selectedJob)}`;

  return (
    <>
      <PortalHeader
        title="Dashboard"
        action={
          <div className="ats-dashboard-filters ats-form">
            <label className="ats-field-label" htmlFor="dashboard-job-filter">
              Filter by job
            </label>
            <CustomSelect
              id="dashboard-job-filter"
              value={selectedJob}
              onChange={setSelectedJob}
              options={jobOptions}
              placeholder="All jobs"
            />
          </div>
        }
      />

      {error ? <div className="ats-toast is-error">{error}</div> : null}

      {loading ? (
        <div className="ats-stat-grid is-loading">
          <div className="ats-skeleton ats-stat-skeleton" />
        </div>
      ) : (
        <div className="ats-stat-grid">
          <AtsStatCard label="Total applications" value={totalApps} href={applicationsHref} />
          <AtsStatCard
            label="Open jobs"
            value={openJobs}
            href={
              selectedJob === '__all'
                ? '/job-portal/postings'
                : `/job-portal/postings/edit?id=${encodeURIComponent(selectedJob)}`
            }
          />
          <AtsStatCard label="New this week" value={newThisWeek} />
          <AtsStatCard label="In interview" value={inInterview} href={applicationsHref} />
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
          <Link href={applicationsHref} className="ats-panel-link">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="ats-skeleton" />
        ) : recentCandidates.length === 0 ? (
          <EmptyState
            icon="users"
            title="No applications yet"
            description={
              selectedJob === '__all'
                ? 'Candidates will appear here once they apply to your jobs.'
                : 'No candidates for this job yet.'
            }
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
          <h2 className="ats-panel-title">
            {selectedJob === '__all' ? 'Active jobs' : 'Selected job'}
          </h2>
          <Link href="/job-portal/postings" className="ats-panel-link">
            All jobs
          </Link>
        </div>
        {loading ? (
          <div className="ats-skeleton" />
        ) : visibleJobs.length === 0 ? (
          <EmptyState
            icon="briefcase"
            title={selectedJob === '__all' ? 'No published jobs' : 'Job not found'}
            description={
              selectedJob === '__all'
                ? 'Publish a job to start receiving applications.'
                : 'This job may have been removed.'
            }
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
                  {(selectedJob === '__all' ? visibleJobs.slice(0, 6) : visibleJobs).map((job) => (
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
