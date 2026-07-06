'use client';

import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/job-api/format';
import ActionsMenu from './ActionsMenu';

function tagClass(status) {
  if (status === 'published') return 'tag-published';
  if (status === 'draft') return 'tag-draft';
  return 'tag-closed';
}

export default function JobTable({ jobs, getApplicantCount }) {
  const router = useRouter();

  if (jobs.length === 0) return null;

  return (
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
  );
}
