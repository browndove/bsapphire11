'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatRelativeTime } from '@/lib/job-api/format';
import { toUserMessage } from '@/lib/job-api/errors';
import { useConfirm } from '@/components/ConfirmProvider';
import { usePortal } from '../PortalContext';
import ActionsMenu from './ActionsMenu';
import NotifyPositionFilledModal from './NotifyPositionFilledModal';

function tagClass(status) {
  if (status === 'published') return 'tag-published';
  if (status === 'draft') return 'tag-draft';
  if (status === 'archived') return 'tag-archived';
  return 'tag-closed';
}

function statusLabel(status) {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function JobTable({ jobs, getApplicantCount }) {
  const router = useRouter();
  const confirm = useConfirm();
  const { removeJob, applications, user, loadAllApplications, mergeApplications } = usePortal();
  const [error, setError] = useState('');
  const [notifyJob, setNotifyJob] = useState(null);

  useEffect(() => {
    if (!notifyJob?.id) return undefined;
    let cancelled = false;
    loadAllApplications({ job_id: notifyJob.id })
      .then(({ applications: rows }) => {
        if (!cancelled) mergeApplications(rows || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [notifyJob?.id, loadAllApplications, mergeApplications]);

  const notifyApplications = useMemo(
    () => (notifyJob ? applications.filter((app) => app.jobId === notifyJob.id) : []),
    [applications, notifyJob]
  );

  const handleDelete = async (job) => {
    const count = getApplicantCount(job.id);
    const ok = await confirm({
      title: 'Delete job posting?',
      message: count
        ? `"${job.title}" has ${count} applicant${count === 1 ? '' : 's'}. Deleting cannot be undone.`
        : `"${job.title}" will be permanently removed.`,
      confirmText: 'Delete job',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await removeJob(job.id);
    } catch (err) {
      setError(toUserMessage(err, 'job'));
      setTimeout(() => setError(''), 4000);
    }
  };

  if (jobs.length === 0) return null;

  return (
    <>
      {error ? <div className="ats-toast is-error" style={{ marginBottom: '1rem' }}>{error}</div> : null}
      <div className="ats-job-list" role="list">
        {jobs.map((job) => {
          const count = getApplicantCount(job.id);
          const canNotify = job.status === 'closed' && count > 0;
          const meta = [
            job.location || null,
            job.department || null,
            count === 1 ? '1 applicant' : `${count} applicants`,
            formatRelativeTime(job.updatedAt || job.createdAt),
          ].filter(Boolean);

          return (
            <article
              key={job.id}
              role="listitem"
              className={`ats-job-row${job.status === 'archived' ? ' is-archived' : ''}`}
              onClick={() => router.push(`/job-portal/postings/edit?id=${encodeURIComponent(job.id)}`)}
            >
              <div className="ats-job-row-main">
                <div className="ats-job-row-title-line">
                  <h3 className="ats-job-row-title">{job.title}</h3>
                  <span className={`tag ${tagClass(job.status)}`}>{statusLabel(job.status)}</span>
                </div>
                <p className="ats-job-row-meta">{meta.join(' · ')}</p>
              </div>

              <div className="ats-job-row-actions" onClick={(event) => event.stopPropagation()}>
                {canNotify ? (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setNotifyJob(job)}
                  >
                    Notify
                  </button>
                ) : null}
                <ActionsMenu
                  items={[
                    {
                      label: 'Edit job',
                      href: `/job-portal/postings/edit?id=${encodeURIComponent(job.id)}`,
                    },
                    {
                      label: 'View candidates',
                      href: `/job-portal/applications?job=${encodeURIComponent(job.id)}`,
                    },
                    ...(job.status === 'closed'
                      ? [
                          {
                            label: 'Notify other applicants',
                            onClick: () => setNotifyJob(job),
                          },
                        ]
                      : []),
                    {
                      label: 'Delete job',
                      danger: true,
                      onClick: () => handleDelete(job),
                    },
                  ]}
                />
              </div>
            </article>
          );
        })}
      </div>

      <NotifyPositionFilledModal
        open={Boolean(notifyJob)}
        job={notifyJob}
        applications={notifyApplications}
        companyName={notifyJob?.companyName || 'Blvck Sapphire'}
        userEmail={user?.email || ''}
        onClose={() => setNotifyJob(null)}
      />
    </>
  );
}
