'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const PortalContext = createContext();

const PIPELINE_STATUSES = ['new', 'screening', 'interview', 'offer', 'hired', 'declined'];

export const PortalStages = {
  labels: {
    new: 'New',
    screening: 'Screening',
    interview: 'Interview',
    offer: 'Offer',
    hired: 'Hired',
    declined: 'Not a fit'
  },
  tagClassByStatus: {
    new: 'tag-stage-new',
    screening: 'tag-stage-screening',
    interview: 'tag-stage-interview',
    offer: 'tag-stage-offer',
    hired: 'tag-stage-hired',
    declined: 'tag-stage-declined'
  }
};

const seedJobs = [
  {
    id: 'job_vp_eng',
    title: 'VP of Software Engineering',
    department: 'Development',
    location: 'Remote, Ghana',
    status: 'published',
    publishedAt: '2026-05-01',
    description: 'Lead platform engineering across product, security, and architecture. Published role with structured screening.',
    screeningQuestions: [
      { id: 'sq_years', label: 'Years leading engineering teams', type: 'single', filterable: true, options: ['0–2', '3–5', '6–10', '10+'] },
      { id: 'sq_tz', label: 'Overlapping timezone (UTC)', type: 'single', filterable: true, options: ['UTC±0–2', 'UTC±3–5', 'Americas-friendly', 'APAC-friendly'] },
      { id: 'sq_stack', label: 'Strongest backend environment', type: 'multi', filterable: true, options: ['Kubernetes', 'Serverless', 'Bare-metal / VM', 'Hybrid'] }
    ]
  },
  {
    id: 'job_ai_eng',
    title: 'AI Engineer',
    department: 'AI & Data',
    location: 'Remote, SA / Europe',
    status: 'published',
    publishedAt: '2026-04-18',
    description: 'Ship production ML features with clear evaluation and monitoring.',
    screeningQuestions: [
      { id: 'sq_ml', label: 'Primary ML focus', type: 'single', filterable: true, options: ['NLP', 'Vision', 'Tabular', 'RL / agents'] },
      { id: 'sq_prod', label: 'Production ML experience', type: 'single', filterable: true, options: ['0–1 years', '1–3 years', '3+ years'] }
    ]
  },
  {
    id: 'job_draft',
    title: 'Product Marketing Manager (draft)',
    department: 'Marketing',
    location: 'Remote',
    status: 'draft',
    publishedAt: null,
    description: 'Draft posting — not visible on public careers until published.',
    screeningQuestions: []
  }
];

const seedApplications = [
  {
    id: 'app_1', jobId: 'job_vp_eng', submittedAt: '2026-05-14T09:22:00', candidateName: 'Ama Osei',
    email: 'ama@example.com', phone: '+233 54 357 9090', source: 'Careers website', status: 'interview',
    notes: 'Strong infra background; scheduled panel for next week.',
    answers: { sq_years: '6–10', sq_tz: 'UTC±3–5', sq_stack: ['Kubernetes', 'Hybrid'] }
  },
  {
    id: 'app_2', jobId: 'job_vp_eng', submittedAt: '2026-05-15T11:05:00', candidateName: 'Kwesi Mensah',
    email: 'kwesi@example.com', phone: '+233 20 551 4821', source: 'Careers website', status: 'screening',
    notes: '', answers: { sq_years: '3–5', sq_tz: 'Americas-friendly', sq_stack: ['Serverless'] }
  },
  {
    id: 'app_3', jobId: 'job_ai_eng', submittedAt: '2026-05-12T14:40:00', candidateName: 'Rosa Kim',
    email: 'rosa@example.com', phone: '+44 7911 558822', source: 'LinkedIn', status: 'offer',
    notes: '', answers: { sq_ml: 'NLP', sq_prod: '3+ years' }
  },
  {
    id: 'app_4', jobId: 'job_ai_eng', submittedAt: '2026-05-13T09:15:00', candidateName: 'James Ndlovu',
    email: 'james@example.com', phone: '+27 82 774 9910', source: 'Referral', status: 'new',
    notes: '', answers: { sq_ml: 'Vision', sq_prod: '1–3 years' }
  }
];

export function PortalProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // Check auth
    setIsAuthed(sessionStorage.getItem('portal_session_v1') === '1');

    // Load or seed jobs
    let loadedJobs = seedJobs;
    try {
      const rawJobs = localStorage.getItem('portal_jobs_v1');
      if (rawJobs) {
        loadedJobs = JSON.parse(rawJobs);
      } else {
        localStorage.setItem('portal_jobs_v1', JSON.stringify(seedJobs));
      }
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    setJobs(loadedJobs);

    // Load or seed applications
    let loadedApps = seedApplications;
    try {
      const rawApps = localStorage.getItem('portal_applications_v2') || localStorage.getItem('portal_applications_v1');
      if (rawApps) {
        loadedApps = JSON.parse(rawApps);
      } else {
        localStorage.setItem('portal_applications_v2', JSON.stringify(seedApplications));
      }
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    setApplications(loadedApps);

    setIsReady(true);
  }, []);

  const login = (password) => {
    if (password === 'portal-demo') {
      sessionStorage.setItem('portal_session_v1', '1');
      setIsAuthed(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('portal_session_v1');
    setIsAuthed(false);
  };

  const saveJobs = (newJobs) => {
    setJobs(newJobs);
    localStorage.setItem('portal_jobs_v1', JSON.stringify(newJobs));
  };

  const upsertJob = (job) => {
    const updated = [...jobs];
    const idx = updated.findIndex(j => j.id === job.id);
    if (idx >= 0) updated[idx] = job;
    else updated.push(job);
    saveJobs(updated);
  };

  const deleteJob = (id) => {
    saveJobs(jobs.filter(j => j.id !== id));
  };

  const saveApplications = (newApps) => {
    setApplications(newApps);
    localStorage.setItem('portal_applications_v2', JSON.stringify(newApps));
  };

  const upsertApplication = (app) => {
    const updated = [...applications];
    const idx = updated.findIndex(a => a.id === app.id);
    if (idx >= 0) updated[idx] = app;
    else updated.push(app);
    saveApplications(updated);
  };

  const resetSeed = () => {
    saveJobs(seedJobs);
    saveApplications(seedApplications);
  };

  const slugifyId = (title) => {
    let base = 'job_' + String(title || 'posting').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
    let id = base;
    let n = 0;
    while (jobs.some(j => j.id === id)) {
      n++;
      id = `${base}_${n}`;
    }
    return id;
  };

  return (
    <PortalContext.Provider value={{
      isReady,
      isAuthed,
      login,
      logout,
      jobs,
      applications,
      upsertJob,
      deleteJob,
      upsertApplication,
      resetSeed,
      slugifyId,
      PIPELINE_STATUSES
    }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
}
