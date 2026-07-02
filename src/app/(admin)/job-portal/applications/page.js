'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortal, PortalStages } from '../PortalContext';

function formatAnswersFlat(app) {
  return Object.keys(app.answers || {}).map(qid => {
    const val = app.answers[qid];
    if (Array.isArray(val)) return val.join(' + ');
    return String(val);
  }).join(' · ');
}

function formatAnswersBrief(app, maxLen = 72) {
  const s = formatAnswersFlat(app);
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 1) + '…';
}

function ApplicationsInbox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobParam = searchParams.get('job');
  
  const { isReady, isAuthed, applications, jobs, PIPELINE_STATUSES } = usePortal();

  const [selectedJob, setSelectedJob] = useState(jobParam || '__all');
  const [selectedStage, setSelectedStage] = useState('__all');
  const [searchQuery, setSearchQuery] = useState('');

  // When jobParam changes in URL, sync it if we are ready
  useEffect(() => {
    if (jobParam) {
      setSelectedJob(jobParam);
    }
  }, [jobParam]);

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace('/job-portal/login');
    }
  }, [isReady, isAuthed, router]);

  const filteredApps = useMemo(() => {
    if (!isReady) return [];
    return applications.filter(a => {
      if (selectedJob !== '__all' && a.jobId !== selectedJob) return false;
      if (selectedStage !== '__all' && a.status !== selectedStage) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const cand = (a.candidateName || '').toLowerCase();
        const em = (a.email || '').toLowerCase();
        const ph = (a.phone || '').toLowerCase();
        if (!cand.includes(q) && !em.includes(q) && !ph.includes(q)) return false;
      }
      return true;
    });
  }, [isReady, applications, selectedJob, selectedStage, searchQuery]);

  if (!isReady || !isAuthed) return null;

  return (
    <>
      <div className="portal-topbar">
        <div className="portal-head-block" style={{ flex: 1, minWidth: '220px', marginBottom: 0 }}>
          <h1 className="portal-title">Applications inbox</h1>
          <p className="hint">Pick a posting, search by candidate, tighten with stage, then drill into screening answers.</p>
        </div>
      </div>

      <div className="help-callout" style={{ marginTop: '1.25rem' }}>
        <strong style={{ color: 'var(--text)' }}>Tip:</strong> Row filters come from each job&apos;s posting. Change the posting to change what you can slice on here.
      </div>

      <div className="toolbar">
        <div>
          <label className="field" htmlFor="pick-job">Posting</label>
          <select 
            id="pick-job" 
            value={selectedJob} 
            onChange={e => setSelectedJob(e.target.value)}
          >
            <option value="__all">All postings</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field" htmlFor="stage-filter">Stage</label>
          <select 
            id="stage-filter"
            value={selectedStage}
            onChange={e => setSelectedStage(e.target.value)}
          >
            <option value="__all">All stages</option>
            {PIPELINE_STATUSES.map(k => (
              <option key={k} value={k}>{PortalStages.labels[k] || k}</option>
            ))}
          </select>
        </div>
        <div className="search-field">
          <label className="field" htmlFor="q-search">Search</label>
          <input 
            type="search" 
            id="q-search" 
            placeholder="Name, email, phone…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="toolbar-spacer"></div>
        <button 
          type="button" 
          className="btn btn-ghost btn-sm" 
          onClick={() => {
            setSelectedJob('__all');
            setSelectedStage('__all');
            setSearchQuery('');
          }}
        >
          Clear all filters
        </button>
      </div>

      <div className="card-table-shell">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Posting</th>
                <th>Stage</th>
                <th>Applied</th>
                <th>Source</th>
                <th>Screening highlights</th>
                <th style={{ width: '7rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                const tagClass = PortalStages.tagClassByStatus[app.status] || 'tag-stage-new';
                const tagLabel = PortalStages.labels[app.status] || app.status;

                return (
                  <tr key={app.id}>
                    <td>
                      <strong>{app.candidateName}</strong><br/>
                      <span className="hint" style={{ fontSize: '0.85rem' }}>{app.email}</span>
                    </td>
                    <td>{job ? job.title : app.jobId}</td>
                    <td><span className={`tag ${tagClass}`}>{tagLabel}</span></td>
                    <td>{new Date(app.submittedAt).toLocaleDateString()}</td>
                    <td>{app.source}</td>
                    <td className="hint" style={{ fontSize: '0.8rem', maxWidth: '16rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {formatAnswersBrief(app)}
                    </td>
                    <td>
                      <Link href={`/job-portal/applications/detail?id=${encodeURIComponent(app.id)}`} className="btn btn-ghost btn-sm">Review</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <p className="hint" style={{ marginTop: '0.85rem' }}>
        Showing {filteredApps.length} application(s).
      </p>
    </>
  );
}

export default function Applications() {
  return (
    <Suspense fallback={<div>Loading inbox...</div>}>
      <ApplicationsInbox />
    </Suspense>
  );
}
