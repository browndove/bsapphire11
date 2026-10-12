'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortal, PortalStages } from '../../PortalContext';
import { toUserMessage } from '@/lib/job-api/errors';
import { formatDate, formatDateTime } from '@/lib/job-api/format';
import { formatAnswerValue } from '@/lib/job-api/mappers';
import { buildSilentStatusPatch, buildStatusEmailDefaults } from '@/lib/job-api/email-templates';
import PortalHeader, { BreadcrumbLink } from '../../components/PortalHeader';
import Avatar from '../../components/Avatar';
import StatusEmailModal from '../../components/StatusEmailModal';
import CustomSelect from '@/components/CustomSelect';
import CoverLetterMaterials from '@/components/candidate/CoverLetterMaterials';
import { useConfirm } from '@/components/ConfirmProvider';
import { fileNameFromStorageKey, resolveApplicationDocuments } from '@/lib/job-api/cover-letter';
import { addReviewNote, readReview, readReviewQueue, writeReview } from '@/lib/job-api/portal-ui';
import DocumentPreview from '../../components/DocumentPreview';

function candidateLabel(item) {
  if (!item) return 'Applicant';
  const email = item.email || item.candidate_email || '';
  const emailName = email ? String(email).split('@')[0] : '';
  return (
    item.candidateName ||
    [
      item.first_name || item.candidate_first_name || item.candidate?.first_name || item.candidate?.candidate_first_name || '',
      item.last_name || item.candidate_last_name || item.candidate?.last_name || item.candidate?.candidate_last_name || '',
    ]
      .filter(Boolean)
      .join(' ') ||
    emailName ||
    'Applicant'
  );
}

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
    updateApplicationStage,
    shortlistApplication,
    finalizeHirePipeline,
    moveApplication,
    user,
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
  const [review, setReview] = useState({ rating: 0, tags: [], notes: [], events: [] });
  const [noteDraft, setNoteDraft] = useState('');
  const [railQuery, setRailQuery] = useState('');
  const openedNotify = useRef(false);
  const railListRef = useRef(null);
  const activeRailRef = useRef(null);

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

  useEffect(() => {
    if (!app?.id) return;
    setReview(readReview(app.id));
    setNoteDraft('');
  }, [app?.id]);

  const reviewIds = useMemo(() => {
    const queued = readReviewQueue();
    if (queued.length) return queued;
    return applications
      .filter((item) => !jobFilter || item.jobId === jobFilter)
      .map((item) => item.id);
  }, [applications, jobFilter, id]);

  const reviewIndex = reviewIds.indexOf(id);
  const previousId = reviewIndex > 0 ? reviewIds[reviewIndex - 1] : '';
  const nextId = reviewIndex >= 0 && reviewIndex < reviewIds.length - 1 ? reviewIds[reviewIndex + 1] : '';

  const sidebarCandidates = useMemo(() => {
    const byId = new Map(applications.map((item) => [item.id, item]));
    const queued = reviewIds.map((candidateId) => byId.get(candidateId)).filter(Boolean);
    if (queued.length) return queued;
    return applications
      .filter((item) => !jobFilter || item.jobId === jobFilter)
      .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
  }, [applications, reviewIds, jobFilter]);

  const visibleRail = useMemo(() => {
    const query = railQuery.trim().toLowerCase();
    if (!query) return sidebarCandidates;
    return sidebarCandidates.filter((item) => {
      const name = candidateLabel(item).toLowerCase();
      const email = String(item.email || '').toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [sidebarCandidates, railQuery]);

  useEffect(() => {
    const item = activeRailRef.current;
    const list = railListRef.current;
    if (!item || !list) return;
    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.offsetHeight;
    if (itemTop < list.scrollTop) list.scrollTop = Math.max(0, itemTop - 8);
    else if (itemBottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = itemBottom - list.clientHeight + 8;
    }
  }, [id, visibleRail]);

  const goToCandidate = (nextCandidateId) => {
    if (!nextCandidateId) return;
    const params = new URLSearchParams({ id: nextCandidateId });
    if (jobFilter) params.set('job', jobFilter);
    router.push(`/job-portal/applications/detail?${params.toString()}`);
  };

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target?.isContentEditable) return;
      if (event.key === 'ArrowLeft') goToCandidate(previousId);
      if (event.key === 'ArrowRight') goToCandidate(nextId);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (!app || openedNotify.current) return;
    if (searchParams.get('notify') !== '1' || !app.email) return;
    openedNotify.current = true;
    setStatusModalError('');
    const defaults = buildStatusEmailDefaults(
      app,
      job,
      app.companyName || 'Blvck Sapphire',
      app.status
    );
    setStatusModal({ targetStatus: app.status, resend: false, ...defaults });
  }, [app, job, searchParams]);

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
  const displayName = candidateLabel(app);

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
      showToast(newStatus === 'shortlisted' ? 'Shortlisted.' : 'Status updated.');
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
      const request =
        payload.status === 'hired'
          ? finalizeHirePipeline(app.id, payload)
          : updateApplicationWithEmail(app.id, payload);
      const { application, emailWarning } = await request;
      setApp(application);
      setStage(application.status);
      setStatusModal(null);
      if (emailWarning) {
        showToast(emailWarning, 'warning');
      } else {
        showToast(
          statusModal?.resend
            ? `Email sent to ${application.email || 'candidate'}.`
            : `Notified ${application.email || 'candidate'}.`
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
      message: `${displayName || 'This candidate'} will be marked as rejected. No email will be sent.`,
      confirmText: 'Reject',
      cancelText: 'Cancel',
      variant: 'danger',
    });

  const confirmHire = async () =>
    confirm({
      title: 'Hire candidate?',
      message:
        `${displayName || 'This candidate'} will be marked as hired.\n\n` +
        'Other applicants stay in their current stages. The job stays open so you can hire more people if needed. No emails will be sent.',
      confirmText: 'Hire',
      cancelText: 'Cancel',
      variant: 'default',
    });

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
          const result = await finalizeHirePipeline(app.id);
          setApp(result.application);
          setStage(result.application.status);
          showToast('Hired.');
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

    setSaving(true);
    setError('');
    try {
      if (newStatus === 'hired') {
        const result = await finalizeHirePipeline(app.id);
        setApp(result.application);
        setStage(result.application.status);
        showToast('Candidate hired.', 'success');
        return;
      }

      if (newStatus === 'shortlisted') {
        const updated = await shortlistApplication(app.id);
        setApp(updated);
        setStage(updated.status);
        showToast('Shortlisted.');
        return;
      }

      const { application } = await updateApplicationStage(
        app.id,
        buildSilentStatusPatch({ status: newStatus })
      );
      setApp(application);
      setStage(application.status);
      showToast('Status updated.');
    } catch (err) {
      setError(toUserMessage(err));
      setStage(app.status);
    } finally {
      setSaving(false);
    }
  };

  const handleShortlist = async () => {
    if (app.status === 'shortlisted') return;
    setSaving(true);
    setError('');
    try {
      const updated = await shortlistApplication(app.id);
      setApp(updated);
      setStage(updated.status);
      showToast('Shortlisted.');
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleMoveStage = () => {
    if (stage === app.status) return;
    setStatusModalError('');
    const defaults = buildStatusEmailDefaults(app, job, companyName, stage);
    setStatusModal({ targetStatus: stage, resend: false, ...defaults });
  };

  const saveReview = (patch, eventText) => {
    const current = readReview(app.id);
    const next = writeReview(app.id, {
      ...patch,
      events: eventText
        ? [{ id: `evt_${Date.now()}`, at: new Date().toISOString(), text: eventText }, ...(current.events || [])]
        : current.events,
    });
    setReview(next);
  };

  const setRating = (star) => {
    const rating = review.rating === star ? 0 : star;
    saveReview(
      { rating },
      rating ? `Rated ${rating} of 5` : 'Cleared the rating'
    );
  };

  const toggleTag = (tag) => {
    const on = review.tags?.includes(tag);
    const tags = on
      ? review.tags.filter((item) => item !== tag)
      : [...(review.tags || []), tag];
    const label = tag === 'shortlisted' ? 'Shortlisted' : 'Not a fit';
    saveReview({ tags }, on ? `Removed “${label}”` : `Marked “${label}”`);
  };

  const submitNote = () => {
    const next = addReviewNote(app.id, {
      author: user?.email || 'Reviewer',
      body: noteDraft,
    });
    setReview(next);
    setNoteDraft('');
  };

  const timeline = [
    app.submittedAt ? { id: 'submitted', at: app.submittedAt, text: 'Application submitted' } : null,
    app.shortlistedAt ? { id: 'shortlisted', at: app.shortlistedAt, text: 'Shortlisted' } : null,
    app.interviewAt ? { id: 'interview', at: app.interviewAt, text: `Interview set for ${formatDateTime(app.interviewAt)}` } : null,
    app.interviewReminderSentAt
      ? { id: 'reminder', at: app.interviewReminderSentAt, text: 'Interview reminder sent' }
      : null,
    ...(review.events || []),
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(b.at) - new Date(a.at));

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

      <div className="ats-candidate-workspace">
        <aside className="ats-candidate-rail" aria-label="Candidates">
          <div className="ats-candidate-rail-head">
            <span>Candidates</span>
            <span>{sidebarCandidates.length}</span>
          </div>
          <input
            className="ats-candidate-rail-search"
            type="search"
            value={railQuery}
            onChange={(event) => setRailQuery(event.target.value)}
            placeholder="Search candidates"
            aria-label="Search candidates"
          />
          <ul className="ats-candidate-rail-list" ref={railListRef}>
            {visibleRail.length === 0 ? (
              <li className="ats-candidate-rail-empty">No matches</li>
            ) : (
              visibleRail.map((item) => {
                const name = candidateLabel(item);
                const active = item.id === id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      ref={active ? activeRailRef : null}
                      className={active ? 'is-active' : ''}
                      aria-current={active ? 'true' : undefined}
                      onClick={() => {
                        if (!active) goToCandidate(item.id);
                      }}
                    >
                      <Avatar name={name} src={item.photoUrl} size="sm" />
                      <span className="ats-candidate-rail-copy">
                        <span className="ats-candidate-rail-top">
                          <span className="ats-candidate-rail-name">{name}</span>
                          {item.submittedAt ? (
                            <span className="ats-candidate-rail-date">{formatDate(item.submittedAt)}</span>
                          ) : null}
                        </span>
                        <span className="ats-candidate-rail-sub">
                          {PortalStages.labels[item.status] || item.status || 'Submitted'}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </aside>
        <div className="ats-candidate-workspace-main">
      <div className="ats-profile-header">
        <Avatar name={displayName} src={app.photoUrl} size="lg" />
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
        <div className="ats-profile-actions ats-review-nav">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={!previousId || saving}
            onClick={() => goToCandidate(previousId)}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={!nextId || saving}
            onClick={() => goToCandidate(nextId)}
          >
            Next
          </button>
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
                  onClick={handleMoveStage}
                  disabled={saving || stage === app.status}
                >
                  {saving ? 'Saving…' : `Move to ${PortalStages.labels[stage] || stage}`}
                </button>
              </div>
              <div className="ats-stage-actions">
                {app.status !== 'shortlisted' &&
                app.status !== 'hired' &&
                app.status !== 'rejected' &&
                app.status !== 'withdrawn' ? (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={saving}
                    onClick={handleShortlist}
                  >
                    Shortlist
                  </button>
                ) : null}
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={saving || !app.email}
                  title={app.email ? 'Compose and send an email for the current stage' : 'No email on file'}
                  onClick={() => openStatusModal(app.status)}
                >
                  {app.status === 'interview' ? 'Send invite' : 'Email candidate'}
                </button>
              </div>
              {app.shortlistedAt ? (
                <p className="ats-filter-hint">
                  Shortlisted {formatDateTime(app.shortlistedAt)}
                </p>
              ) : null}
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

            {(app.githubUrl || app.additionalLinks?.length) ? (
              <div className="ats-material-block">
                <p className="ats-material-label">Links</p>
                <CoverLetterMaterials
                  mode="links"
                  githubUrl={app.githubUrl}
                  additionalLinks={app.additionalLinks}
                />
              </div>
            ) : null}

            <div className="ats-material-block">
              <p className="ats-material-label">Resume</p>
              <DocumentPreview
                href={app.resumeUrl}
                fileName={app.resumeUrl ? fileNameFromStorageKey(app.resumeUrl) : ''}
              />
            </div>
          </section>
        </div>

        <section className="ats-panel ats-scorecard">
          <div className="ats-panel-head">
            <div>
              <h3 className="ats-panel-title">Evaluation</h3>
              <p className="ats-scorecard-note">Saved on this browser only. Other reviewers will not see it.</p>
            </div>
          </div>
          <div className="ats-scorecard-row">
            <div>
              <span className="ats-field-label">Rating</span>
              <div className="ats-rating" role="group" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`ats-star${review.rating >= star ? ' is-on' : ''}`}
                    aria-label={`${star} star${star === 1 ? '' : 's'}`}
                    aria-pressed={review.rating >= star}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
                <span className="ats-rating-label">
                  {review.rating ? `${review.rating} of 5` : 'Not rated'}
                </span>
              </div>
            </div>
            <div>
              <span className="ats-field-label">Quick tags</span>
              <div className="ats-tag-row">
                <button
                  type="button"
                  className={`ats-eval-tag is-fit${review.tags?.includes('shortlisted') ? ' is-on' : ''}`}
                  aria-pressed={review.tags?.includes('shortlisted')}
                  onClick={() => toggleTag('shortlisted')}
                >
                  Shortlisted
                </button>
                <button
                  type="button"
                  className={`ats-eval-tag is-pass${review.tags?.includes('not-a-fit') ? ' is-on' : ''}`}
                  aria-pressed={review.tags?.includes('not-a-fit')}
                  onClick={() => toggleTag('not-a-fit')}
                >
                  Not a fit
                </button>
              </div>
            </div>
          </div>
          <div className="ats-note-composer">
            <label className="ats-field-label" htmlFor="candidate-note">Internal note</label>
            <textarea
              id="candidate-note"
              rows={3}
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              placeholder="What stood out in this application?"
            />
            <button type="button" className="btn btn-primary btn-sm" onClick={submitNote} disabled={!noteDraft.trim()}>
              Add note
            </button>
          </div>
          {(review.notes || []).length ? (
            <ul className="ats-note-list">
              {review.notes.map((note) => (
                <li key={note.id}>
                  <div className="ats-note-meta">
                    <strong>{note.author}</strong>
                    <span>{formatDateTime(note.at)}</span>
                  </div>
                  <p>{note.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ats-field-hint">No notes yet.</p>
          )}
        </section>

        <section className="ats-panel ats-detail-panel">
          <div className="ats-panel-head">
            <h3 className="ats-panel-title">Activity</h3>
          </div>
          {timeline.length ? (
            <ol className="ats-timeline">
              {timeline.map((event) => (
                <li key={event.id}>
                  <strong>{event.text}</strong>
                  <span>{formatDateTime(event.at)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="ats-field-hint">No activity recorded yet.</p>
          )}
        </section>

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
