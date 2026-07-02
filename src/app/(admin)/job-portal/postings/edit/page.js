'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortal } from '../../PortalContext';

function PostingEditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { isReady, isAuthed, jobs, slugifyId, upsertJob } = usePortal();

  const [job, setJob] = useState({
    id: '',
    title: '',
    department: '',
    location: '',
    status: 'draft',
    publishedAt: '',
    description: '',
    screeningQuestions: []
  });
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace('/job-portal/login');
      return;
    }
    if (isReady && id) {
      const existingJob = jobs.find(j => j.id === id);
      if (existingJob) setJob(existingJob);
    }
  }, [isReady, isAuthed, id, jobs, router]);

  if (!isReady || !isAuthed) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const isNew = !job.id;
    const saveId = isNew ? slugifyId(job.title) : job.id;
    const finalJob = { ...job, id: saveId };

    if (finalJob.status === 'published' && !finalJob.publishedAt) {
      finalJob.publishedAt = new Date().toISOString().split('T')[0];
    }

    upsertJob(finalJob);
    setToast('Saved successfully!');
    setTimeout(() => setToast(''), 3000);

    if (isNew) {
      router.replace(`/job-portal/postings/edit?id=${encodeURIComponent(saveId)}`);
    }
  };

  const updateField = (field, value) => {
    setJob(prev => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    const newQ = {
      id: 'sq_' + Math.random().toString(36).slice(2, 10),
      label: '',
      type: 'single',
      filterable: true,
      options: []
    };
    setJob(prev => ({ ...prev, screeningQuestions: [...prev.screeningQuestions, newQ] }));
  };

  const updateQuestion = (qId, field, value) => {
    setJob(prev => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.map(q => {
        if (q.id === qId) {
          if (field === 'optionsRaw') {
            return { ...q, options: value.split('\n').map(s => s.trim()).filter(Boolean) };
          }
          return { ...q, [field]: value };
        }
        return q;
      })
    }));
  };

  const removeQuestion = (qId) => {
    setJob(prev => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.filter(q => q.id !== qId)
    }));
  };

  return (
    <>
      <div className="portal-head-block">
        <div>
          <p className="hint" style={{ marginBottom: '0.35rem' }}>
            <Link href="/job-portal/postings" style={{ color: 'var(--muted)' }}>&larr; Postings</Link>
          </p>
          <h1 className="portal-title" id="page-heading">{id ? 'Edit posting' : 'New posting'}</h1>
          <p className="hint">Define what appears externally only after status is published. Screening blocks drive applicant form + filter chips.</p>
        </div>
      </div>

      <div className="card">
        <form id="job-form" onSubmit={handleSave}>
          <div className="form-grid cols-2" style={{ marginBottom: '1rem' }}>
            <div>
              <label className="field" htmlFor="field-title">Job title</label>
              <input 
                type="text" 
                id="field-title" 
                required 
                maxLength="140" 
                placeholder="e.g. Staff Platform Engineer"
                value={job.title}
                onChange={e => updateField('title', e.target.value)}
              />
            </div>
            <div>
              <label className="field" htmlFor="field-dept">Department</label>
              <input 
                type="text" 
                id="field-dept" 
                placeholder="Development, Marketing, …"
                value={job.department}
                onChange={e => updateField('department', e.target.value)}
              />
            </div>
            <div>
              <label className="field" htmlFor="field-location">Location</label>
              <input 
                type="text" 
                id="field-location" 
                placeholder="Remote, Accra hybrid, …"
                value={job.location}
                onChange={e => updateField('location', e.target.value)}
              />
            </div>
            <div>
              <label className="field" htmlFor="field-status">Status</label>
              <select 
                id="field-status"
                value={job.status}
                onChange={e => updateField('status', e.target.value)}
              >
                <option value="draft">Draft (internal)</option>
                <option value="published">Published (visible on careers)</option>
                <option value="closed">Closed (hidden, keep history)</option>
              </select>
            </div>
            <div>
              <label className="field" htmlFor="field-published">Publication date</label>
              <input 
                type="text" 
                id="field-published" 
                placeholder="YYYY-MM-DD or leave blank for drafts"
                value={job.publishedAt || ''}
                onChange={e => updateField('publishedAt', e.target.value)}
              />
              <p className="field-hint">Backend can automate this timestamp on publish.</p>
            </div>
          </div>

          <label className="field" htmlFor="field-desc">Public description HTML</label>
          <textarea 
            id="field-desc" 
            placeholder="Rendered on public job page Rich text/HTML after sanitization …"
            value={job.description}
            onChange={e => updateField('description', e.target.value)}
          ></textarea>

          <h3 style={{ margin: '1.5rem 0 0.65rem' }}>Screening questions</h3>
          <p className="hint">Each block can populate the public apply form and, when marked filterable + options, feeds the recruiter filter toolbar.</p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={addQuestion} style={{ margin: '0.5rem 0 1rem' }}>Add question block</button>
          
          <div id="questions-mount">
            {job.screeningQuestions.map(q => (
              <div key={q.id} className="question-block">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <label className="field">Label / Question text</label>
                    <input 
                      type="text" 
                      required 
                      value={q.label}
                      onChange={e => updateQuestion(q.id, 'label', e.target.value)}
                    />
                  </div>
                  <div style={{ width: '140px' }}>
                    <label className="field">Type</label>
                    <select 
                      value={q.type}
                      onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                    >
                      <option value="single">Single select</option>
                      <option value="multi">Multi select</option>
                      <option value="text">Text (short)</option>
                      <option value="longtext">Text (paragraph)</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <label className="field">Options (one per line, for selects)</label>
                    <textarea 
                      style={{ minHeight: '4.5rem' }}
                      value={q.options ? q.options.join('\n') : ''}
                      onChange={e => updateQuestion(q.id, 'optionsRaw', e.target.value)}
                    ></textarea>
                  </div>
                  <div style={{ width: '140px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="field">Recruiter filter?</label>
                    <select 
                      value={q.filterable ? 'true' : 'false'}
                      onChange={e => updateQuestion(q.id, 'filterable', e.target.value === 'true')}
                    >
                      <option value="true">Yes (filterable)</option>
                      <option value="false">No (hidden in filters)</option>
                    </select>
                    <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => removeQuestion(q.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="toolbar" style={{ marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary">Save posting</button>
            <Link href="/job-portal/postings" className="btn btn-ghost">Cancel</Link>
          </div>
          <p className="hint" style={{ marginTop: '1rem', color: 'var(--success)', fontWeight: 600 }}>{toast}</p>
        </form>
      </div>
    </>
  );
}

export default function PostingEdit() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostingEditForm />
    </Suspense>
  );
}
