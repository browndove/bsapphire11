'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/job-api/format';
import { toUserMessage } from '@/lib/job-api/errors';
import { useConfirm } from '@/components/ConfirmProvider';
import { usePortal } from '../PortalContext';
import ActionsMenu from './ActionsMenu';

function tagClass(status) {
  if (status === 'published') return 'tag-published';
  if (status === 'draft') return 'tag-draft';
  return 'tag-closed';
}

export default function JobTable({ jobs, getApplicantCount }) {
  const router = useRouter();
  const confirm = useConfirm();
  const { removeJob } = usePortal();
  const [error, setError] = useState('');

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
      <div className="ats-table-shell">
      <div className="ats-table-wrap">
        <table className="ats-table">
          <thead>
            <tr>
              <th>Job title</th>
              <th>Location</th>
              <th>Status</th>
              <th>Applicants</th>
              <th>Updated</th>
              <th className="ats-table-actions-col" />
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const count = getApplicantCount(job.id);
              return (
                <tr
                  key={job.id}
                  onClick={() => router.push(`/job-portal/postings/edit?id=${encodeURIComponent(job.id)}`)}
                >
                  <td>
                    <strong>{job.title}</strong>
                    {job.department ? <div className="ats-table-sub">{job.department}</div> : null}
                  </td>
                  <td>{job.location || '—'}</td>
                  <td><span className={`tag ${tagClass(job.status)}`}>{job.status}</span></td>
                  <td>
                    <span className={`ats-count-pill${count > 0 ? ' has-value' : ''}`}>{count}</span>
                  </td>
                  <td className="ats-table-sub">{formatDate(job.updatedAt)}</td>
                  <td className="ats-table-actions-col" onClick={(e) => e.stopPropagation()}>
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
                        {
                          label: 'Delete job',
                          danger: true,
                          onClick: () => handleDelete(job),
                        },
                      ]}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
    </>
  );
}
