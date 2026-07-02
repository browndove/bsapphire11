'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePortal } from '../PortalContext';

export default function Dashboard() {
  const router = useRouter();
  const { isReady, isAuthed, jobs, applications, PIPELINE_STATUSES, PortalStages } = usePortal();

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace('/job-portal/login');
    }
  }, [isReady, isAuthed, router]);

  if (!isReady || !isAuthed) return null;

  const pubJobs = jobs.filter(j => j.status === 'published');
  const draftJobs = jobs.filter(j => j.status === 'draft');

  const stages = PIPELINE_STATUSES.map(k => ({
    key: k,
    count: applications.filter(a => a.status === k).length
  }));

  const labels = {
    new: 'New',
    screening: 'Screening',
    interview: 'Interview',
    offer: 'Offer',
    hired: 'Hired',
    declined: 'Not a fit'
  };

  return (
    <>
      <div className="portal-topbar">
        <div className="portal-head-block" style={{ flex: 1, minWidth: '220px', marginBottom: 0 }}>
          <h1 className="portal-title">Dashboard</h1>
          <p className="hint">Your hiring pipeline at a glance. Everything here syncs locally until you plug in an API.</p>
        </div>
        <Link href="/job-portal/applications" className="btn btn-ghost btn-sm">Inbox</Link>
        <Link href="/job-portal/postings/edit" className="btn btn-primary">New posting</Link>
      </div>

      <div className="grid-stats" id="stats-row" style={{ marginTop: '2rem' }}>
        <div className="stat-card"><strong>{applications.length}</strong><span>Applications</span></div>
        <div className="stat-card"><strong>{pubJobs.length}</strong><span>Live postings</span></div>
        <div className="stat-card"><strong>{draftJobs.length}</strong><span>Drafts</span></div>
        <div className="stat-card"><strong>{jobs.length}</strong><span>Total postings</span></div>
      </div>

      <h2 style={{ fontSize: '1rem', marginBottom: '0.85rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>Pipeline</h2>
      <div className="pipeline-row" id="pipeline-row">
        {stages.map(s => (
          <div key={s.key} className="pipeline-step">
            <span>{labels[s.key] || s.key}</span>
            <strong>{s.count}</strong>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>How it fits together</h3>
        <ul className="hint" style={{ maxWidth: '50rem', lineHeight: 1.75, paddingLeft: '1.25rem' }}>
          <li><strong>Posts</strong> start as drafts under <strong>Job postings</strong>; only <strong>Published</strong> roles mirror the careers page.</li>
          <li><strong>Screening blocks</strong> define both the candidate form (later) and the <strong>filter chips</strong> in Applications.</li>
          <li>Open an applicant row for <strong>stage + notes</strong> reviewers need day to day.</li>
        </ul>
      </div>

      <div className="card">
        <h3>Published roles — jump to inbox</h3>
        <p className="hint" style={{ marginBottom: '0.75rem' }}>Shows only live postings.</p>
        <div className="toolbar" style={{ marginBottom: 0 }} id="published-links">
          {pubJobs.length === 0 ? (
            <span className="hint">No published roles.</span>
          ) : (
            pubJobs.map(j => (
              <Link 
                key={j.id} 
                href={`/job-portal/applications?job=${encodeURIComponent(j.id)}`} 
                className="btn btn-ghost btn-sm"
              >
                {j.title}
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}
