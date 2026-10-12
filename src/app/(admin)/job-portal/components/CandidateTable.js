'use client';

import { useRouter } from 'next/navigation';
import Avatar from './Avatar';
import { formatRelativeTime } from '@/lib/job-api/format';
import { formatAnswerValue } from '@/lib/job-api/mappers';
import { PortalStages } from '../PortalContext';
import { readReview } from '@/lib/job-api/portal-ui';

function displayNameFor(app) {
  const email = app.email || app.candidate_email || '';
  const emailName = email ? String(email).split('@')[0] : '';
  return (
    app.candidateName ||
    [
      app.first_name || app.candidate_first_name || app.candidate?.first_name || '',
      app.last_name || app.candidate_last_name || app.candidate?.last_name || '',
    ]
      .filter(Boolean)
      .join(' ') ||
    emailName ||
    'Applicant'
  );
}

function SortButton({ label, sortKey, activeKey, dir, onSort }) {
  const active = activeKey === sortKey;
  return (
    <button type="button" className="ats-sort-btn" onClick={() => onSort?.(sortKey)}>
      {label}
      <span aria-hidden="true">{active ? (dir === 'asc' ? ' ▲' : ' ▼') : ''}</span>
    </button>
  );
}

export default function CandidateTable({
  applications,
  jobs,
  screeningQuestions,
  onRowClick,
  selectable = false,
  selectedIds = [],
  onToggleRow,
  onToggleAll,
  sortKey = 'submittedAt',
  sortDir = 'desc',
  onSort,
  onToggleShortlist,
}) {
  const router = useRouter();
  const selected = new Set(selectedIds);
  const allSelected = applications.length > 0 && applications.every((app) => selected.has(app.id));

  const handleClick = (app) => {
    if (onRowClick) {
      onRowClick(app);
      return;
    }
    const params = new URLSearchParams({ id: app.id });
    if (app.jobId) params.set('job', app.jobId);
    router.push(`/job-portal/applications/detail?${params.toString()}`);
  };

  if (applications.length === 0) return null;

  return (
    <div className="ats-table-shell">
      <div className="ats-table-wrap">
        <table className="ats-table">
          <thead>
            <tr>
              {selectable ? (
                <th className="ats-check-col">
                  <input
                    type="checkbox"
                    aria-label="Select all candidates on this page"
                    checked={allSelected}
                    onChange={(event) => onToggleAll?.(event.target.checked)}
                  />
                </th>
              ) : null}
              <th>
                <SortButton label="Candidate" sortKey="name" activeKey={sortKey} dir={sortDir} onSort={onSort} />
              </th>
              <th>Job</th>
              {screeningQuestions?.length ? <th>Screening</th> : null}
              <th className="ats-col-fit">
                <SortButton label="Stage" sortKey="status" activeKey={sortKey} dir={sortDir} onSort={onSort} />
              </th>
              <th className="ats-col-fit">
                <SortButton label="Applied" sortKey="submittedAt" activeKey={sortKey} dir={sortDir} onSort={onSort} />
              </th>
              {onToggleShortlist ? <th className="ats-col-fit" aria-label="Shortlist" /> : null}
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const job = jobs.find((item) => item.id === app.jobId);
              const tagClass = PortalStages.tagClassByStatus[app.status] || 'tag-stage-new';
              const tagLabel = PortalStages.labels[app.status] || app.status;
              const displayName = displayNameFor(app);
              const email = app.email || app.candidate_email || '';
              const review = readReview(app.id);
              const answers = (screeningQuestions || [])
                .map((question) => ({
                  label: question.label,
                  value: formatAnswerValue(app.answers?.[question.id]),
                }))
                .filter((item) => item.value);

              return (
                <tr key={app.id} onClick={() => handleClick(app)}>
                  {selectable ? (
                    <td className="ats-check-col" onClick={(event) => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`Select ${displayName}`}
                        checked={selected.has(app.id)}
                        onChange={() => onToggleRow?.(app.id)}
                      />
                    </td>
                  ) : null}
                  <td>
                    <div className="ats-table-cell-name">
                      <Avatar name={displayName} src={app.photoUrl} size="sm" />
                      <div>
                        <strong>
                          {displayName}
                          {app.resumeUrl ? <span className="ats-attach" title="Resume attached"> 📎</span> : null}
                        </strong>
                        {email ? <div className="ats-table-sub">{email}</div> : null}
                      </div>
                    </div>
                  </td>
                  <td>{job?.title || app.jobTitle || '—'}</td>
                  {screeningQuestions?.length ? (
                    <td>
                      <div className="ats-answer-pills">
                        {answers.slice(0, 2).map((item) => (
                          <span key={item.label} className="ats-answer-pill" title={`${item.label}: ${item.value}`}>
                            {item.value}
                          </span>
                        ))}
                        {answers.length > 2 ? (
                          <span className="ats-answer-pill" title={answers.slice(2).map((item) => `${item.label}: ${item.value}`).join('\n')}>
                            +{answers.length - 2}
                          </span>
                        ) : null}
                        {answers.length === 0 ? <span className="ats-table-sub">—</span> : null}
                      </div>
                    </td>
                  ) : null}
                  <td><span className={`tag ${tagClass}`}>{tagLabel}</span></td>
                  <td className="ats-table-sub">{formatRelativeTime(app.submittedAt)}</td>
                  {onToggleShortlist ? (
                    <td onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        className={`ats-star${review.tags?.includes('shortlisted') || app.status === 'shortlisted' ? ' is-on' : ''}`}
                        aria-label="Shortlist"
                        onClick={() => onToggleShortlist(app)}
                      >
                        ★
                      </button>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
