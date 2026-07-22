'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from './Avatar';
import { formatRelativeTime } from '@/lib/job-api/format';
import { formatAnswerValue } from '@/lib/job-api/mappers';
import { PortalStages } from '../PortalContext';

function candidateDisplayName(app) {
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

function answerSortValue(app, questionId) {
  return String(formatAnswerValue(app.answers?.[questionId]) || '')
    .trim()
    .toLowerCase();
}

function compareValues(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export default function ScreeningResponsesTable({
  applications = [],
  questions = [],
  jobId,
}) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState('submittedAt');
  const [sortDir, setSortDir] = useState('desc');

  const columns = useMemo(() => {
    if (questions?.length) return questions;
    const seen = new Map();
    for (const app of applications) {
      for (const [id, value] of Object.entries(app.answers || {})) {
        if (!seen.has(id)) {
          seen.set(id, {
            id,
            label: id.replace(/^sq_/, '').replace(/_/g, ' '),
          });
        }
        void value;
      }
    }
    return [...seen.values()];
  }, [questions, applications]);

  const sortedApps = useMemo(() => {
    const rows = [...applications];
    const dir = sortDir === 'asc' ? 1 : -1;

    rows.sort((left, right) => {
      let cmp = 0;
      if (sortKey === 'candidate') {
        cmp = compareValues(
          candidateDisplayName(left).toLowerCase(),
          candidateDisplayName(right).toLowerCase()
        );
      } else if (sortKey === 'stage') {
        cmp = compareValues(left.status || '', right.status || '');
      } else if (sortKey === 'submittedAt') {
        const a = left.submittedAt ? new Date(left.submittedAt).getTime() : 0;
        const b = right.submittedAt ? new Date(right.submittedAt).getTime() : 0;
        cmp = a - b;
      } else if (sortKey.startsWith('q:')) {
        const qid = sortKey.slice(2);
        cmp = compareValues(answerSortValue(left, qid), answerSortValue(right, qid));
      }
      if (cmp !== 0) return cmp * dir;
      return compareValues(candidateDisplayName(left), candidateDisplayName(right));
    });

    return rows;
  }, [applications, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir(key === 'submittedAt' ? 'desc' : 'asc');
  };

  const sortIndicator = (key) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  const openDetail = (app) => {
    const params = new URLSearchParams({ id: app.id });
    if (jobId) params.set('job', jobId);
    router.push(`/job-portal/applications/detail?${params.toString()}`);
  };

  if (!applications.length) return null;

  return (
    <div className="ats-responses-shell">
      <div className="ats-responses-toolbar">
        <div>
          <h3 className="ats-responses-title">Responses</h3>
          <p className="ats-responses-meta">
            {applications.length} response{applications.length === 1 ? '' : 's'}
            {columns.length
              ? ` · ${columns.length} question${columns.length === 1 ? '' : 's'}`
              : ''}
          </p>
        </div>
        <p className="ats-field-hint" style={{ margin: 0 }}>
          Click a column header to sort. Click a row to open the candidate.
        </p>
      </div>

      <div className="ats-table-shell ats-responses-table-shell">
        <div className="ats-table-wrap ats-responses-table-wrap">
          <table className="ats-table ats-responses-table">
            <thead>
              <tr>
                <th className="ats-responses-sticky">
                  <button type="button" className="ats-sort-btn" onClick={() => toggleSort('candidate')}>
                    Candidate{sortIndicator('candidate')}
                  </button>
                </th>
                <th>
                  <button type="button" className="ats-sort-btn" onClick={() => toggleSort('stage')}>
                    Stage{sortIndicator('stage')}
                  </button>
                </th>
                <th>
                  <button type="button" className="ats-sort-btn" onClick={() => toggleSort('submittedAt')}>
                    Submitted{sortIndicator('submittedAt')}
                  </button>
                </th>
                {columns.map((q) => (
                  <th key={q.id}>
                    <button
                      type="button"
                      className="ats-sort-btn"
                      onClick={() => toggleSort(`q:${q.id}`)}
                      title={q.label}
                    >
                      {q.label}
                      {sortIndicator(`q:${q.id}`)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedApps.map((app) => {
                const displayName = candidateDisplayName(app);
                const tagClass = PortalStages.tagClassByStatus[app.status] || 'tag-stage-new';
                const tagLabel = PortalStages.labels[app.status] || app.status;

                return (
                  <tr key={app.id} onClick={() => openDetail(app)}>
                    <td className="ats-responses-sticky">
                      <div className="ats-table-cell-name">
                        <Avatar name={displayName} size="sm" />
                        <div>
                          <strong>{displayName}</strong>
                          {app.email ? <div className="ats-table-sub">{app.email}</div> : null}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`tag ${tagClass}`}>{tagLabel}</span>
                    </td>
                    <td className="ats-table-sub">{formatRelativeTime(app.submittedAt)}</td>
                    {columns.map((q) => {
                      const value = formatAnswerValue(app.answers?.[q.id]);
                      return (
                        <td key={q.id} className="ats-responses-answer">
                          {value || <span className="ats-table-sub">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
