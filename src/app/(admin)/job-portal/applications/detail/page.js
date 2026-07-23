'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortal, PortalStages } from '../../PortalContext';
import { toUserMessage } from '@/lib/job-api/errors';
import { formatDateTime } from '@/lib/job-api/format';
import { formatAnswerValue } from '@/lib/job-api/mappers';
import { buildStatusEmailDefaults, buildStatusEmailPatch } from '@/lib/job-api/email-templates';
import PortalHeader, { BreadcrumbLink } from '../../components/PortalHeader';
import Avatar from '../../components/Avatar';
import StatusEmailModal from '../../components/StatusEmailModal';
import CustomSelect from '@/components/CustomSelect';
import CoverLetterMaterials, { FileCard } from '@/components/candidate/CoverLetterMaterials';
import { useConfirm } from '@/components/ConfirmProvider';
import { resolveApplicationDocuments } from '@/lib/job-api/cover-letter';

function ApplicationDetailView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const jobFilter = searchParams.get('job');
  const confirm = useConfirm();

  const {
    isReady,
    isAuthed,
    isPreview,
    applications,
    jobs,
    STATUS_UPDATE_OPTIONS,
    updateApplicationWithEmail,
    finalizeHirePipeline,
    countOtherOpenApplicants,
    moveApplication,
    loadApplications,
    mergeApplications,
  } = usePortal();

  const [app, setApp] = useState(null);
  const [job, setJob] = useState(null);
  const [stage, setStage] = useState('submitted');
  const [toast, setToast] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [statusModal, setStatusModal] = useState(null);
  const [statusModalError, setStatusModalError] = useState('');
  const [loadingApp, setLoadingApp] = useState(true);

  useEffect(() => {
    if (!isReady) return undefined;
    if (!isAuthed) {
      router.replace('/job-portal/login');
      return undefined;
    }
    if (!id) {
      router.replace('/job-portal/applications');
      return undefined;
    }

    let cancelled = false;

    const applyFound = (foundApp) => {
      setApp(foundApp);
      setStage(foundApp.status || 'submitted');
      setJob(jobs.find((j) => j.id === foundApp.jobId) || null);
      setLoadingApp(false);
    };

    async function resolveApplication() {
      const cached = applications.find((a) => a.id === id);
      if (cached) {
        applyFound(cached);
        return;
      }

      setLoadingApp(true);
      try {
        const params = { limit: 500, offset: 0 };
        if (jobFilter) params.job_id = jobFilter;
        let { applications: rows } = await loadApplications(params);
        let match = (rows || []).find((a) => a.id === id);

        if (!match && jobFilter) {
          const all = await loadApplications({ limit: 500, offset: 0 });
          match = (all.applications || []).find((a) => a.id === id);
          rows = all.applications;
        }

        if (cancelled) return;

        if (match) {
          mergeApplications(rows || [match]);
          applyFound(match);
          return;
        }

        router.replace(
          jobFilter
            ? `/job-portal/applications?job=${encodeURIComponent(jobFilter)}`
            : '/job-portal/applications'
        );
      } catch {
        if (!cancelled) {
          router.replace('/job-portal/applications');
        }
      } finally {
        if (!cancelled) setLoadingApp(false);
      }
    }

    resolveApplication();
    return () => {
      cancelled = true;
    };
  }, [
    isReady,
    isAuthed,
    id,
    jobFilter,
    applications,
    jobs,
    loadApplications,
    mergeApplications,
    router,
  ]);

  if (!isReady || !isAuthed || loadingApp) {
    return <div className="ats-skeleton" />;
  }

  if (!app) return null;

  const documents = resolveApplicationDocuments({
    coverLetter: app.coverLetter,
    additionalDocumentUrl: app.additionalDocumentUrl,
  });

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

  const companyName = app.companyName || 'Blvck Sapphire';

  const showToast = (message, variant = 'success') => {
    setToast(message);
    setToastVariant(variant);
    setTimeout(() => setToast(''), variant === 'warning' ? 6000 : 3000);
  };

  const openStatusModal = (targetStatus, { resend = false } = {}) => {
    setStatusModalError('');
    const defaults = buildStatusEmailDefaults(app, job, companyName, targetStatus);
    setStatusModal({ targetStatus, resend, ...defaults });
  };

  const applyStatusPreview = async (newStatus) => {
    setSaving(true);
    setError('');
    try {
      const updated = await moveApplication(app.id, newStatus);
      setApp(updated);
      setStage(updated.status);
      showToast('Status updated.');
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusEmailSubmit = async (payload) => {
    setSaving(true);
    setStatusModalError('');
    try {
      if (payload.status === 'hired' && !statusModal?.resend) {
        const result = await finalizeHirePipeline(app.id, payload);
        setApp(result.application);
        setStage(result.application.status);
        setStatusModal(null);

        const parts = [];
        if (result.emailWarning) {
          parts.push(result.emailWarning);
        } else {
          parts.push(
            `Hired ${result.application.candidateName || displayName} and emailed them.`
          );
        }
        if (result.rejectedCount > 0) {
          parts.push(
            `Rejected all ${result.rejectedCount} other applicant${result.rejectedCount === 1 ? '' : 's'} with rejection emails.`
          );
        }
        if (result.leftoverCount > 0) {
          parts.push(
            `${result.leftoverCount} applicant${result.leftoverCount === 1 ? '' : 's'} could not be rejected — check the board.`
          );
        }
        if (result.rejectionEmailFailures > 0) {
          parts.push(
            `${result.rejectionEmailFailures} rejection email${result.rejectionEmailFailures === 1 ? '' : 's'} failed to send.`
          );
        }
        if (result.rejectionFailures?.length) {
          parts.push(
            `Could not reject ${result.rejectionFailures.length} applicant${result.rejectionFailures.length === 1 ? '' : 's'}.`
          );
        }
        if (result.jobClosed) {
          parts.push('Job posting closed.');
        } else if (result.jobCloseError) {
          parts.push(`Job was not closed: ${result.jobCloseError}`);
        }

        const isWarning =
          !!result.emailWarning ||
          result.rejectionEmailFailures > 0 ||
          (result.rejectionFailures?.length || 0) > 0 ||
          (result.leftoverCount || 0) > 0 ||
          !!result.jobCloseError;
        showToast(parts.join(' '), isWarning ? 'warning' : 'success');
        return;
      }

      const { application, emailWarning } = await updateApplicationWithEmail(app.id, payload);
      setApp(application);
      setStage(application.status);
      setStatusModal(null);
      if (emailWarning) {
        showToast(emailWarning, 'warning');
      } else {
        showToast(
          statusModal?.resend
            ? `Email sent to ${application.email || 'candidate'}.`
            : `Status updated and email sent to ${application.email || 'candidate'}.`
        );
      }
    } catch (err) {
      setStatusModalError(toUserMessage(err, 'status-email'));
    } finally {
      setSaving(false);
    }
  };

  const confirmReject = async () =>
    confirm({
      title: 'Reject candidate?',
      message: `${displayName || 'This candidate'} will be marked as rejected and notified by email.`,
      confirmText: 'Continue',
      cancelText: 'Cancel',
      variant: 'danger',
    });

  const confirmHire = async () => {
    const others = countOtherOpenApplicants(app.jobId, app.id);
    return confirm({
      title: 'Hire candidate?',
      message:
        `${displayName || 'This candidate'} will be hired and emailed.\n\n` +
        (others > 0
          ? `All ${others} other applicant${others === 1 ? '' : 's'} for this job will be rejected and emailed a rejection.\n\n`
          : 'There are no other open applicants for this job.\n\n') +
        'This job posting will be closed.',
      confirmText: 'Hire & reject others',
      cancelText: 'Cancel',
      variant: 'default',
    });
  };

  const requestStatusChange = async (newStatus) => {
    if (newStatus === app.status) return;

    if (newStatus === 'rejected') {
      const ok = await confirmReject();
      if (!ok) return;
    }

    if (newStatus === 'hired') {
      const ok = await confirmHire();
      if (!ok) return;
    }

    if (isPreview) {
      if (newStatus === 'hired') {
        setSaving(true);
        setError('');
        try {
          const defaults = buildStatusEmailDefaults(app, job, companyName, 'hired');
          const payload = buildStatusEmailPatch({
            status: 'hired',
            emailSubject: defaults.fields.emailSubject,
            emailBody: defaults.fields.emailBody,
          });
          const result = await finalizeHirePipeline(app.id, payload);
          setApp(result.application);
          setStage(result.application.status);
          showToast(
            `Hired. Rejected ${result.rejectedCount} other(s).${result.jobClosed ? ' Job closed.' : ''}`
          );
        } catch (err) {
          setError(toUserMessage(err));
        } finally {
          setSaving(false);
        }
        return;
      }
      await applyStatusPreview(newStatus);
      return;
    }

    openStatusModal(newStatus);
  };

  const handleSave = async () => {
    await requestStatusChange(stage);
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
            {app.email ? (
              <a href={`mailto:${app.email}`}>{app.email}</a>
            ) : (
              'No email'
            )}
            {app.submittedAt ? ` · Applied ${formatDateTime(app.submittedAt)}` : ''}
          </p>
          <span className={`tag ${tagClass}`}>{tagLabel}</span>
        </div>
      </div>

      {toast ? (
        <div className={`ats-toast is-${toastVariant === 'warning' ? 'warning' : 'success'}`}>
          {toast}
        </div>
      ) : null}
      {error ? <div className="ats-toast is-error">{error}</div> : null}

      {app.emailSent === false ? (
        <div className="ats-email-retry-banner" role="status">
          <div>
            <strong>Email could not be delivered.</strong>
            <p>
              {app.emailError ||
                'The status was saved, but the candidate did not receive the notification.'}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={saving}
            onClick={() => openStatusModal(app.status, { resend: true })}
          >
            Retry email
          </button>
        </div>
      ) : null}

      <StatusEmailModal
        key={
          statusModal
            ? `${app.id}-${statusModal.targetStatus}-${statusModal.resend ? 'resend' : 'change'}`
            : 'closed'
        }
        open={!!statusModal}
        application={app}
        initialFields={statusModal?.fields}
        interviewIso={statusModal?.interviewIso}
        targetStatus={statusModal?.targetStatus}
        isResend={!!statusModal?.resend}
        onClose={() => {
          if (!saving) setStatusModal(null);
        }}
        onSubmit={handleStatusEmailSubmit}
        submitting={saving}
        error={statusModalError}
      />

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
              {app.interviewAt ? (
                <div className="ats-meta-cell ats-meta-cell--wide">
                  <dt className="ats-meta-label">Interview</dt>
                  <dd className="ats-meta-value">
                    {formatDateTime(app.interviewAt)}
                    {app.interviewReminderSentAt
                      ? ` · Reminder sent ${formatDateTime(app.interviewReminderSentAt)}`
                      : ''}
                  </dd>
                </div>
              ) : null}
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
              <CoverLetterMaterials
                coverLetter={app.coverLetter}
                additionalDocumentUrl={app.additionalDocumentUrl}
              />
            </div>

            {documents.additionalDocumentUrl ? (
              <div className="ats-material-block">
                <p className="ats-material-label">Additional document</p>
                <CoverLetterMaterials
                  mode="additional"
                  coverLetter={app.coverLetter}
                  additionalDocumentUrl={app.additionalDocumentUrl}
                />
              </div>
            ) : null}

            {(app.githubUrl || app.additionalLink) ? (
              <div className="ats-material-block">
                <p className="ats-material-label">Links</p>
                <CoverLetterMaterials
                  mode="links"
                  githubUrl={app.githubUrl}
                  additionalLink={app.additionalLink}
                />
              </div>
            ) : null}

            <div className="ats-material-block">
              <p className="ats-material-label">Resume</p>
              {app.resumeUrl ? (
                <FileCard
                  title="Resume attached"
                  subtitle="PDF or document on file"
                  href={app.resumeUrl}
                  actionLabel="View resume"
                />
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
