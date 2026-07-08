'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortal, PortalStages } from '../../PortalContext';
import { toUserMessage } from '@/lib/job-api/errors';
import { formatDateTime } from '@/lib/job-api/format';
import { formatAnswerValue } from '@/lib/job-api/mappers';
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

  const screeningQuestions = job?.screeningQuestions || [];
  const answerEntries = screeningQuestions.length
    ? screeningQuestions.map((q) => ({
        id: q.id,
        label: q.label,
        value: formatAnswerValue(app.answers?.[q.id]),
      }))
    : Object.entries(app.answers || {}).map(([id, value]) => ({
        id,
        label: id.replace(/^sq_/, '').replace(/_/g, ' '),
        value: formatAnswerValue(value),
      }));

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

      {toast ? <div className="ats-toast is-success">{toast}</div> : null}
      {error ? <div className="ats-toast is-error">{error}</div> : null}

      <div className="ats-candidate-detail">
        <div className="ats-detail-grid">
          <section className="ats-panel ats-detail-panel">
            <div className="ats-panel-head">
              <h3 className="ats-panel-title">Contact & job</h3>
            </div>

            <dl className="ats-meta-grid">
              <div className="ats-meta-cell">
                <dt className="ats-meta-label">Email</dt>
                <dd className={`ats-meta-value${app.email ? '' : ' is-empty'}`}>
                  {app.email ? (
                    <a href={`mailto:${app.email}`}>{app.email}</a>
                  ) : (
                    'Not provided'
                  )}
                </dd>
              </div>
              <div className="ats-meta-cell">
                <dt className="ats-meta-label">Phone</dt>
                <dd className={`ats-meta-value${app.phone ? '' : ' is-empty'}`}>
                  {app.phone || 'Not provided'}
                </dd>
              </div>
              <div className="ats-meta-cell ats-meta-cell--wide">
                <dt className="ats-meta-label">Job</dt>
                <dd className="ats-meta-value">
                  {job ? (
                    <Link href={`/job-portal/postings/edit?id=${encodeURIComponent(job.id)}`}>
                      {job.title}
                      {job.location ? ` · ${job.location}` : ''}
                    </Link>
                  ) : (
                    app.jobTitle || app.jobId
                  )}
                </dd>
              </div>
              <div className="ats-meta-cell">
                <dt className="ats-meta-label">Source</dt>
                <dd className="ats-meta-value">{app.source || 'Website'}</dd>
              </div>
            </dl>

            <div className="ats-panel-divider" />

            <div className="ats-stage-control">
              <label className="ats-field-label" htmlFor="cand-stage">Update stage</label>
              <div className="ats-stage-control-row">
                <CustomSelect
                  id="cand-stage"
                  value={stage}
                  onChange={setStage}
                  options={stageOptions}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                  disabled={saving || stage === app.status}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            <div className="ats-panel-footer">
              <Link href={backUrl} className="ats-back-link">&larr; Back to candidates</Link>
            </div>
          </section>

          <section className="ats-panel ats-detail-panel">
            <div className="ats-panel-head">
              <h3 className="ats-panel-title">Application materials</h3>
            </div>

            <div className="ats-material-block">
              <p className="ats-material-label">Cover letter</p>
              {app.coverLetter ? (
                <blockquote className="ats-prose-block">{app.coverLetter}</blockquote>
              ) : (
                <div className="ats-empty-card">No cover letter provided.</div>
              )}
            </div>

            <div className="ats-material-block">
              <p className="ats-material-label">Resume</p>
              {app.resumeUrl ? (
                <div className="ats-file-card">
                  <div className="ats-file-card-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8l-6-6Z" strokeLinejoin="round" />
                      <path d="M14 2v6h6" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="ats-file-card-body">
                    <strong>Resume attached</strong>
                    <span>PDF or document on file</span>
                  </div>
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    View resume
                  </a>
                </div>
              ) : (
                <div className="ats-empty-card">No resume uploaded.</div>
              )}
            </div>
          </section>
        </div>

        {answerEntries.length ? (
          <section className="ats-panel ats-detail-panel ats-detail-panel--full">
            <div className="ats-panel-head">
              <h3 className="ats-panel-title">Screening answers</h3>
              <span className="ats-panel-badge">{answerEntries.length}</span>
            </div>
            <div className="ats-answer-grid">
              {answerEntries.map((entry) => (
                <article className="ats-answer-card" key={entry.id}>
                  <h4>{entry.label}</h4>
                  <p>{entry.value || '—'}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
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
