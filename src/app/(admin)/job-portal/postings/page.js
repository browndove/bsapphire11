'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePortal } from '../PortalContext';

function tagClass(status) {
  if (status === 'published') return 'tag-published';
  if (status === 'draft') return 'tag-draft';
  return 'tag-closed';
}

export default function Postings() {
  const router = useRouter();
  const { isReady, isAuthed, jobs, resetSeed } = usePortal();

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace('/job-portal/login');
    }
  }, [isReady, isAuthed, router]);

  if (!isReady || !isAuthed) return null;

  return (
    <>
      <div className="portal-topbar">
        <div className="portal-head-block" style={{ flex: 1, minWidth: '220px', marginBottom: 0 }}>
          <h1 className="portal-title">Job postings</h1>
          <p className="hint">Draft vs published separates what recruiters prep internally from jobs that mirror the careers site.</p>
        </div>
        <div className="toolbar" style={{ margin: 0 }}>
          <Link href="/job-portal/postings/edit" className="btn btn-primary">New posting</Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={resetSeed}>Reload demo seed</button>
        </div>
      </div>

      <div className="card-table-shell">
        <div className="table-wrap">
          <table className="data" id="jobs-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Team</th>
                <th>Status</th>
                <th>Screeners</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => {
                const n = j.screeningQuestions && j.screeningQuestions.length ? j.screeningQuestions.length : 0;
                return (
                  <tr key={j.id}>
                    <td>{j.title}</td>
                    <td>{j.department || '—'}</td>
                    <td>
                      <span className={`tag ${tagClass(j.status)}`}>{j.status}</span>
                    </td>
                    <td>{n}</td>
                    <td>{j.publishedAt || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Link href={`/job-portal/postings/edit?id=${encodeURIComponent(j.id)}`} className="btn btn-ghost btn-sm">Edit</Link>{' '}
                      <Link href={`/job-portal/applications?job=${encodeURIComponent(j.id)}`} className="btn btn-ghost btn-sm">Apps</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {jobs.length === 0 && (
        <div id="empty-jobs" className="empty">
          <strong>No postings yet</strong>
          <br/>Use &ldquo;New posting&rdquo; or reload the demo dataset.
        </div>
      )}
    </>
  );
}
