'use client';

import { useRouter } from 'next/navigation';
import Avatar from './Avatar';
import { formatRelativeTime } from '@/lib/job-api/format';
import { formatAnswerValue } from '@/lib/job-api/mappers';
import { PortalStages } from '../PortalContext';

export default function CandidateTable({ applications, jobs, screeningQuestions, onRowClick }) {
  const router = useRouter();

  const handleClick = (app) => {
    if (onRowClick) {
      onRowClick(app);
    } else {
      router.push(`/job-portal/applications/detail?id=${encodeURIComponent(app.id)}`);
    }
  };

  if (applications.length === 0) {
    return null;
  }

  return (
    <div className="ats-table-shell">
      <div className="ats-table-wrap">
        <table className="ats-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Job</th>
              {screeningQuestions?.length ? <th>Screening</th> : null}
              <th>Stage</th>
              <th>Applied</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const job = jobs.find((j) => j.id === app.jobId);
              const tagClass = PortalStages.tagClassByStatus[app.status] || 'tag-stage-new';
              const tagLabel = PortalStages.labels[app.status] || app.status;
              const email = app.email || app.candidate_email || '';
              const emailName = email ? String(email).split('@')[0] : '';
              const displayName =
                app.candidateName ||
                [
                  app.first_name || app.candidate_first_name || app.candidate?.first_name || app.candidate?.candidate_first_name || '',
                  app.last_name || app.candidate_last_name || app.candidate?.last_name || app.candidate?.candidate_last_name || '',
                ]
                  .filter(Boolean)
                  .join(' ') ||
                emailName ||
                'Applicant';

              return (
                <tr key={app.id} onClick={() => handleClick(app)}>
                  <td>
                    <div className="ats-table-cell-name">
                      <Avatar name={displayName} size="sm" />
                      <div>
                        <strong>{displayName}</strong>
                        {app.email ? (
                          <div className="ats-table-sub">
                            <a
                              href={`mailto:${app.email}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {app.email}
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td>{job?.title || app.jobTitle || '—'}</td>
                  {screeningQuestions?.length ? (
                    <td className="ats-table-sub">
                      {screeningQuestions
                        .map((q) => formatAnswerValue(app.answers?.[q.id]))
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </td>
                  ) : null}
                  <td><span className={`tag ${tagClass}`}>{tagLabel}</span></td>
                  <td className="ats-table-sub">{formatRelativeTime(app.submittedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
