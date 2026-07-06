'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortal, PortalStages } from '../../PortalContext';
import { toUserMessage } from '@/lib/job-api/errors';
import { formatDateTime } from '@/lib/job-api/format';
import PortalHeader, { BreadcrumbLink } from '../../components/PortalHeader';
import Avatar from '../../components/Avatar';
import StageStepper from '../../components/StageStepper';
import QuickActions from '../../components/QuickActions';
import CustomSelect from '@/components/CustomSelect';
import { useConfirm } from '@/components/ConfirmProvider';

function ApplicationDetailView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const jobFilter = searchParams.get('job');
  const confirm = useConfirm();

  const { isReady, isAuthed, applications, jobs, STATUS_UPDATE_OPTIONS, upsertApplication } = usePortal();

  const [app, setApp] = useState(null);
  const [job, setJob] = useState(null);
  const [stage, setStage] = useState('submitted');
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace('/job-portal/login');
      return;
    }
    if (isReady && id) {
      const foundApp = applications.find((a) => a.id === id);
      if (foundApp) {
        setApp(foundApp);
        setStage(foundApp.status || 'submitted');
        setJob(jobs.find((j) => j.id === foundApp.jobId) || null);
      } else {
        router.replace('/job-portal/applications');
      }
    }
  }, [isReady, isAuthed, id, applications, jobs, router]);

  if (!isReady || !isAuthed || !app) return null;

  const backUrl = jobFilter
    ? `/job-portal/applications?job=${encodeURIComponent(jobFilter)}`
    : '/job-portal/applications';
  const tagClass = PortalStages.tagClassByStatus[stage] || 'tag-stage-new';
  const tagLabel = PortalStages.labels[stage] || stage;
  const displayName =
    app.candidateName ||
    [
      app.first_name || app.candidate_first_name || app.candidate?.first_name || app.candidate?.candidate_first_name || '',
      app.last_name || app.candidate_last_name || app.candidate?.last_name || app.candidate?.candidate_last_name || '',
    ]
      .filter(Boolean)
      .join(' ') ||
    (app.email ? String(app.email).split('@')[0] : 'Applicant');

  const applyStatus = async (newStatus) => {
    setSaving(true);
    setError('');
    try {
      const updated = await upsertApplication({ ...app, status: newStatus });
      setApp(updated);
      setStage(updated.status);
      setToast('Status updated.');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmReject = async () =>
    confirm({
      title: 'Reject candidate?',
      message: `${displayName || 'This candidate'} will be marked as rejected.`,
      confirmText: 'Reject',
      cancelText: 'Cancel',
      variant: 'danger',
    });

  const handleQuickAction = async (newStatus) => {
    if (newStatus === 'rejected') {
      const ok = await confirmReject();
      if (!ok) return;
    }
    await applyStatus(newStatus);
  };

  const handleSave = async () => {
    if (stage === 'rejected' && stage !== app.status) {
      const ok = await confirmReject();
      if (!ok) return;
    }
    await applyStatus(stage);
  };

  const stageOptions = (stage === 'submitted' && !STATUS_UPDATE_OPTIONS.includes(stage)
    ? ['submitted', ...STATUS_UPDATE_OPTIONS]
    : STATUS_UPDATE_OPTIONS
  ).map((k) => ({ value: k, label: PortalStages.labels[k] || k }));

  return (
    <>
      <PortalHeader
        breadcrumb={
          <>
            <BreadcrumbLink href="/job-portal/applications">Candidates</BreadcrumbLink>
            <span aria-hidden="true"> / </span>
            <span>{displayName}</span>
          </>
        }
        title=""
      />

      <div className="ats-profile-header">
        <Avatar name={displayName} size="lg" />
        <div className="ats-profile-info">
          <h1>{displayName}</h1>
          <p className="ats-profile-meta">
            {app.email || 'No email'}
            {app.submittedAt ? ` · Applied ${formatDateTime(app.submittedAt)}` : ''}
          </p>
          <span className={`tag ${tagClass}`}>{tagLabel}</span>
        </div>
      </div>

      <StageStepper currentStatus={stage} />

      <QuickActions currentStatus={stage} onAction={handleQuickAction} saving={saving} />

      {toast ? <p className="hint toast-success">{toast}</p> : null}
      {error ? <p className="login-error is-visible">{error}</p> : null}

      <div className="ats-detail-grid">
        <div className="ats-panel">
          <h3 className="ats-panel-title">Contact & job</h3>
          <p className="contact-field">
            <strong>Email</strong><br />
            {app.email ? (
              <a href={`mailto:${app.email}`}>{app.email}</a>
            ) : (
              <span className="hint">No email</span>
            )}
          </p>
          <p className="contact-field">
            <strong>Phone</strong><br />
            <span>{app.phone || <span className="hint">No phone</span>}</span>
          </p>
          <p className="contact-field">
            <strong>Job</strong><br />
            {job ? (
              <Link href={`/job-portal/postings/edit?id=${encodeURIComponent(job.id)}`}>
                {job.title}
                {job.location ? ` · ${job.location}` : ''}
              </Link>
            ) : (
              app.jobTitle || app.jobId
            )}
          </p>
          <p className="contact-field">
            <strong>Source</strong><br />
            <span>{app.source || 'Website'}</span>
          </p>

          <label className="ats-field-label field-spaced" htmlFor="cand-stage">Stage (manual)</label>
          <CustomSelect
            id="cand-stage"
            value={stage}
            onChange={setStage}
            options={stageOptions}
          />
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ marginTop: '0.75rem' }}
            onClick={handleSave}
            disabled={saving || stage === app.status}
          >
            {saving ? 'Saving…' : 'Save stage'}
          </button>
          <p className="hint" style={{ marginTop: '1rem' }}>
            <Link href={backUrl}>&larr; Back to candidates</Link>
          </p>
        </div>

        <div className="ats-panel">
          <h3 className="ats-panel-title">Application materials</h3>
          {app.coverLetter ? (
            <div className="answer-block">
              <strong>Cover letter</strong>
              <span>{app.coverLetter}</span>
            </div>
          ) : (
            <p className="hint">No cover letter provided.</p>
          )}
          {app.resumeUrl ? (
            <p className="contact-field" style={{ marginTop: '1rem' }}>
              <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                View resume
              </a>
            </p>
          ) : (
            <p className="hint" style={{ marginTop: '1rem' }}>No resume uploaded.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default function ApplicationDetail() {
  return (
    <Suspense fallback={<div className="ats-skeleton" />}>
      <ApplicationDetailView />
    </Suspense>
  );
}
