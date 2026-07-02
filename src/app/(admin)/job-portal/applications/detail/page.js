'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortal, PortalStages } from '../../PortalContext';

function ApplicationDetailView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const jobFilter = searchParams.get('job');
  
  const { isReady, isAuthed, applications, jobs, PIPELINE_STATUSES, upsertApplication } = usePortal();

  const [app, setApp] = useState(null);
  const [job, setJob] = useState(null);
  const [notes, setNotes] = useState('');
  const [stage, setStage] = useState('new');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace('/job-portal/login');
      return;
    }
    if (isReady && id) {
      const foundApp = applications.find(a => a.id === id);
      if (foundApp) {
        setApp(foundApp);
        setNotes(foundApp.notes || '');
        setStage(foundApp.status || 'new');
        const foundJob = jobs.find(j => j.id === foundApp.jobId);
        setJob(foundJob || null);
      } else {
        router.replace('/job-portal/applications');
      }
    }
  }, [isReady, isAuthed, id, applications, jobs, router]);

  if (!isReady || !isAuthed || !app) return null;

  const handleSave = () => {
    const updatedApp = { ...app, notes, status: stage };
    upsertApplication(updatedApp);
    setToast('Saved!');
    setTimeout(() => setToast(''), 3000);
  };

  const backUrl = jobFilter ? `/job-portal/applications?job=${encodeURIComponent(jobFilter)}` : '/job-portal/applications';
  const tagClass = PortalStages.tagClassByStatus[stage] || 'tag-stage-new';
  const tagLabel = PortalStages.labels[stage] || stage;

  return (
    <>
      <p className="hint" style={{ marginBottom: '0.5rem' }}>
        <Link href={backUrl}>&larr; Applications inbox</Link>
      </p>
      <div className="portal-topbar">
        <div className="portal-head-block" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
          <h1 className="portal-title">{app.candidateName || 'Applicant'}</h1>
          <p className="hint">
            {job ? `${job.title}${job.location ? ' · ' + job.location : ''}` : app.jobId}
          </p>
        </div>
        <span>
          <span className={`tag ${tagClass}`}>{tagLabel}</span>
        </span>
      </div>

      <div className="help-callout" style={{ marginTop: '1rem' }}>
        <strong style={{ color: 'var(--text)' }}>Workflow:</strong> move the <strong>stage</strong> as you review, and leave fast <strong>notes</strong> your team sees on the record (your API replaces local storage).
      </div>

      <div className="detail-grid" style={{ marginTop: '1.25rem' }}>
        <div className="card">
          <h3>Contact</h3>
          <p style={{ margin: '0.5rem 0' }}>
            <strong>Email</strong><br/>
            {app.email ? (
              <a href={`mailto:${app.email}`}>{app.email}</a>
            ) : (
              <span className="hint">No email</span>
            )}
          </p>
          <p style={{ margin: '0.5rem 0' }}><strong>Phone</strong><br/><span>{app.phone || <span className="hint">No phone</span>}</span></p>
          <p style={{ margin: '0.35rem 0' }}><strong className="hint">Applied</strong><br/><span>{new Date(app.submittedAt).toLocaleDateString()}</span></p>
          <p style={{ margin: '0.35rem 0' }}><strong className="hint">Source</strong><br/><span>{app.source || 'Website'}</span></p>
          
          <label className="field" style={{ marginTop: '1rem' }} htmlFor="cand-stage">Pipeline stage</label>
          <select 
            id="cand-stage"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          >
            {PIPELINE_STATUSES.map(k => (
              <option key={k} value={k}>{PortalStages.labels[k] || k}</option>
            ))}
          </select>
        </div>
        
        <div className="card">
          <h3>Team notes</h3>
          <label className="field" htmlFor="cand-notes" style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 600, color: 'var(--text)' }}>
            Interview notes · next steps · referral context
          </label>
          <textarea 
            id="cand-notes" 
            placeholder="Type once, teammates read everywhere this profile appears…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
          <p className="field-hint" style={{ minHeight: '1.25rem', color: 'var(--success)', fontWeight: 600 }}>{toast}</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleSave}>Save changes</button>
        </div>
      </div>

      <div className="card">
        <h3>Screening answers</h3>
        <div className="answer-grid">
          {Object.keys(app.answers || {}).length === 0 ? (
            <p className="hint">No screening questions answered.</p>
          ) : (
            Object.keys(app.answers).map(qid => {
              const sq = job?.screeningQuestions?.find(q => q.id === qid);
              const label = sq ? sq.label : qid;
              let ans = app.answers[qid];
              if (Array.isArray(ans)) ans = ans.join(', ');
              return (
                <div key={qid} className="answer-block">
                  <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--text)' }}>{label}</strong>
                  <span style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>{String(ans)}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default function ApplicationDetail() {
  return (
    <Suspense fallback={<div>Loading application...</div>}>
      <ApplicationDetailView />
    </Suspense>
  );
}
