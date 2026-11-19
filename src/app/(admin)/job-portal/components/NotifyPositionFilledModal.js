'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  applyEmailPlaceholders,
  findUnresolvedEmailPlaceholders,
} from '@/lib/job-api/email-templates';
import {
  assertCanNotifyPositionFilled,
  buildPositionFilledContext,
  buildPositionFilledEmailHtml,
  candidateDisplayName,
  getPositionFilledDraftFields,
  POSITION_FILLED_CAREERS_URL,
  POSITION_FILLED_COMPANY_EMAIL,
  resolvePublicCareersUrl,
  resolvePositionFilledSendList,
  selectPositionFilledRecipients,
} from '@/lib/job-api/position-filled';
import {
  createPositionFilledCampaign,
  listNotifiedApplicationIds,
  readPositionFilledCampaign,
  runPositionFilledCampaign,
  updateCampaignRecipient,
} from '@/lib/job-api/position-filled-campaign';
import { sendPositionFilledEmail } from '@/lib/job-api/client';
import { toUserMessage } from '@/lib/job-api/errors';
import { mapApplicationFromApi } from '@/lib/job-api/mappers';

function careersUrl() {
  if (typeof window === 'undefined') return POSITION_FILLED_CAREERS_URL;
  return resolvePublicCareersUrl(`${window.location.origin}/careers`);
}

export default function NotifyPositionFilledModal({
  open,
  job,
  applications = [],
  companyName = 'Blvck Sapphire',
  userEmail = '',
  onClose,
  onComplete,
}) {
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState('');
  const [excludedIds, setExcludedIds] = useState([]);
  const [allowResend, setAllowResend] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [testTo, setTestTo] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const alreadyNotifiedIds = useMemo(
    () => (job?.id ? listNotifiedApplicationIds(job.id) : []),
    [job?.id, open, campaign]
  );

  const { eligible } = useMemo(
    () => selectPositionFilledRecipients(applications),
    [applications]
  );

  const { toSend, excludedRecipients, alreadySent } = useMemo(
    () =>
      resolvePositionFilledSendList({
        eligible,
        excludedIds,
        alreadyNotifiedIds,
        allowResend,
      }),
    [eligible, excludedIds, alreadyNotifiedIds, allowResend]
  );

  const visibleEligible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return eligible;
    return eligible.filter((app) => {
      const name = candidateDisplayName(app).toLowerCase();
      const email = String(app.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [eligible, query]);

  useEffect(() => {
    if (!open || !job) return;
    const draft = getPositionFilledDraftFields(job, companyName, careersUrl());
    setSubject(draft.emailSubject);
    setBody(draft.emailBody);
    setTestTo(userEmail || '');
    setExcludedIds([]);
    setAllowResend(false);
    setQuery('');
    setError('');
    setNotice('');
    setConfirmChecked(false);
    setBusy(false);
    const existing = readPositionFilledCampaign(job.id);
    setCampaign(existing);
    setStep(existing?.status === 'completed' || existing?.status === 'running' ? 4 : 1);
  }, [open, job, companyName, userEmail]);

  const previewContext = useMemo(() => {
    const sample = toSend[0] || applications[0] || {
      firstName: 'Alex',
      candidateName: 'Alex Example',
      email: 'alex@example.com',
    };
    return buildPositionFilledContext(sample, job, companyName, careersUrl());
  }, [toSend, applications, job, companyName]);

  const previewSubject = useMemo(
    () => applyEmailPlaceholders(subject, previewContext),
    [subject, previewContext]
  );
  const previewBody = useMemo(
    () => applyEmailPlaceholders(body, previewContext),
    [body, previewContext]
  );
  const previewHtml = useMemo(
    () => buildPositionFilledEmailHtml(previewBody, previewContext),
    [previewBody, previewContext]
  );

  if (!open || !job) return null;

  const stepLabels = ['Recipients', 'Message', 'Confirm', 'Sending'];
  const activeStep = Math.min(step, 3);

  const toggleId = (id) => {
    setExcludedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAllVisible = () => {
    const visibleIds = new Set(visibleEligible.map((app) => app.id));
    setExcludedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
  };

  const deselectAllVisible = () => {
    const visibleIds = visibleEligible.map((app) => app.id);
    setExcludedIds((prev) => [...new Set([...prev, ...visibleIds])]);
  };

  const unresolved = findUnresolvedEmailPlaceholders(subject, body).filter(
    (token) =>
      ![
        '{{candidate_name}}',
        '{{job_title}}',
        '{{company_name}}',
        '{{company_email}}',
        '{{company_site}}',
        '{{careers_url}}',
        '{{first_name}}',
        '{{last_name}}',
      ].includes(token)
  );

  const personalizedPayload = (app, subjectText, bodyText) => {
    const context = buildPositionFilledContext(app, job, companyName, careersUrl());
    const emailSubject = applyEmailPlaceholders(subjectText, context);
    const emailBody = applyEmailPlaceholders(bodyText, context);
    return {
      emailSubject,
      emailBody,
      emailHtml: buildPositionFilledEmailHtml(emailBody, context),
    };
  };

  const startSend = async ({ retryFailedOnly = false, resumeRemaining = false } = {}) => {
    setError('');
    setNotice('');
    try {
      assertCanNotifyPositionFilled(job, { isAuthed: true, isEmployer: true });
    } catch (err) {
      setError(err.message);
      return;
    }

    if (!retryFailedOnly && !resumeRemaining) {
      if (!toSend.length) {
        setError('Select at least one recipient.');
        return;
      }
      if (!confirmChecked) {
        setError('Confirm that you want to send these emails.');
        return;
      }
      if (unresolved.length) {
        setError(`Replace leftover placeholders: ${unresolved.join(', ')}`);
        return;
      }

      const created = createPositionFilledCampaign({
        jobId: job.id,
        jobTitle: job.title,
        sentBy: userEmail,
        subject,
        body,
        toSend,
        excluded: excludedRecipients,
      });
      setCampaign(created);
    }

    setBusy(true);
    setStep(4);

    try {
      const latest = await runPositionFilledCampaign({
        jobId: job.id,
        applications,
        onlyFailed: retryFailedOnly && !resumeRemaining,
        onProgress: setCampaign,
        sendOne: async (app) => {
          const payload = personalizedPayload(app, subject, body);
          const raw = await sendPositionFilledEmail(job.id, {
            applicationId: app.id,
            ...payload,
          });
          const mapped = mapApplicationFromApi(raw?.data || raw);
          if (raw?.email_sent === false || mapped.emailSent === false) {
            return {
              ok: false,
              error: raw?.email_error || mapped.emailError || 'Email was not delivered.',
            };
          }
          return { ok: true, application: mapped };
        },
      });
      setCampaign(latest);
      if (latest?.status === 'paused') {
        setNotice(latest.pauseReason || 'Paused after repeated email delivery failures. Remaining stayed queued.');
      }
      onComplete?.(latest);
    } catch (err) {
      setError(toUserMessage(err, 'status-email'));
    } finally {
      setBusy(false);
    }
  };

  const retryOne = async (applicationId) => {
    const app = applications.find((item) => item.id === applicationId);
    if (!app || !job) return;
    setBusy(true);
    setError('');
    updateCampaignRecipient(job.id, applicationId, { status: 'queued', error: '' });
    try {
      const payload = personalizedPayload(app, subject || campaign?.subject, body || campaign?.body);
      const raw = await sendPositionFilledEmail(job.id, {
        applicationId: app.id,
        ...payload,
      });
      const mapped = mapApplicationFromApi(raw?.data || raw);
      if (raw?.email_sent === false || mapped.emailSent === false) {
        throw new Error(raw?.email_error || mapped.emailError || 'Email was not delivered.');
      }
      const next = updateCampaignRecipient(job.id, applicationId, { status: 'sent', error: '' });
      setCampaign(next);
      onComplete?.(next);
    } catch (err) {
      const next = updateCampaignRecipient(job.id, applicationId, {
        status: 'failed',
        error: toUserMessage(err, 'status-email'),
      });
      setCampaign(next);
      setError(toUserMessage(err, 'status-email'));
    } finally {
      setBusy(false);
    }
  };

  const findApplicantByEmail = (email) => {
    const needle = String(email || '').trim().toLowerCase();
    if (!needle) return null;
    return (
      applications.find((app) => String(app.email || '').trim().toLowerCase() === needle) || null
    );
  };

  const openMailtoDraft = (to) => {
    const sample = findApplicantByEmail(to) || applications[0] || {
      firstName: 'Alex',
      candidateName: 'Alex Example',
      email: to,
    };
    const context = buildPositionFilledContext(sample, job, companyName, careersUrl());
    const testSubject = `[TEST] ${applyEmailPlaceholders(subject, context)}`;
    const testBody = applyEmailPlaceholders(body, context);
    const href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(testSubject)}&body=${encodeURIComponent(testBody)}`;
    window.location.href = href;
  };

  const sendTestEmail = async () => {
    const to = String(testTo || '').trim();
    if (!to || !to.includes('@')) {
      setError('Enter a valid test email address.');
      return;
    }

    const matched = findApplicantByEmail(to);
    if (!matched) {
      setError(
        `${to} is not an applicant on this job. Live emails only go to applicant addresses (this send went to the listed candidates, not your inbox). Apply with that email on a closed-job notify list, or use Open draft.`
      );
      return;
    }

    const status = String(matched.status || '').toLowerCase();
    if (status === 'hired') {
      setError('That applicant is marked hired / selected, so they cannot receive this notice.');
      return;
    }
    if (status === 'withdrawn') {
      setError('That applicant withdrew, so they cannot receive this notice.');
      return;
    }

    setError('');
    setBusy(true);
    try {
      assertCanNotifyPositionFilled(job, { isAuthed: true, isEmployer: true });
      const payload = personalizedPayload(matched, subject, body);
      const raw = await sendPositionFilledEmail(job.id, {
        applicationId: matched.id,
        ...payload,
      });
      const mapped = mapApplicationFromApi(raw?.data || raw);
      if (raw?.email_sent === false || mapped.emailSent === false) {
        throw new Error(raw?.email_error || mapped.emailError || 'Email was not delivered.');
      }
      setNotice(`Live test sent to ${to}. Check that inbox (and spam).`);
    } catch (err) {
      setError(toUserMessage(err, 'status-email'));
    } finally {
      setBusy(false);
    }
  };

  const counts = campaign?.counts || {
    queued: toSend.length,
    sent: 0,
    failed: 0,
    excluded: excludedRecipients.length + alreadySent.length,
  };

  const topFailureReason = (() => {
    const tally = new Map();
    for (const row of campaign?.recipients || []) {
      if (row.status !== 'failed' || !row.error) continue;
      tally.set(row.error, (tally.get(row.error) || 0) + 1);
    }
    let best = '';
    let bestCount = 0;
    for (const [message, count] of tally) {
      if (count > bestCount) {
        best = message;
        bestCount = count;
      }
    }
    return best ? { message: best, count: bestCount } : null;
  })();

  return (
    <div className="status-email-overlay" role="presentation" onClick={() => (!busy ? onClose?.() : null)}>
      <div
        className="status-email-dialog ats-form ats-position-filled-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="position-filled-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="status-email-dialog-head">
          <div>
            <h2 id="position-filled-title">Notify other applicants</h2>
            <p className="ats-field-hint" style={{ margin: '0.35rem 0 0' }}>
              {job.title} · closed role
            </p>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={busy}>
            Close
          </button>
        </div>

        {step < 4 ? (
          <ol className="ats-pf-steps" aria-label="Notify steps">
            {stepLabels.slice(0, 3).map((label, index) => {
              const n = index + 1;
              const state = n < activeStep ? 'done' : n === activeStep ? 'current' : '';
              return (
                <li key={label} className={state ? `is-${state}` : undefined} aria-current={n === activeStep ? 'step' : undefined}>
                  <span className="ats-pf-step-num">{n}</span>
                  <span className="ats-pf-step-label">{label}</span>
                </li>
              );
            })}
          </ol>
        ) : null}

        {error ? <div className="ats-toast is-error">{error}</div> : null}
        {notice ? <div className="ats-toast is-success">{notice}</div> : null}

        {step === 1 ? (
          <>
            <p className="ats-field-hint">
              {toSend.length} of {eligible.length} will receive this email
              {alreadySent.length ? ` · ${alreadySent.length} already notified` : ''}
              {excludedRecipients.length ? ` · ${excludedRecipients.length} excluded` : ''}.
            </p>
            <div className="ats-position-filled-toolbar">
              <input
                type="search"
                className="ats-position-filled-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name or email"
                aria-label="Search recipients"
              />
              <button type="button" className="btn btn-outline btn-sm" onClick={selectAllVisible}>
                Select all
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={deselectAllVisible}>
                Deselect all
              </button>
            </div>
            {alreadySent.length ? (
              <label className="ats-position-filled-resend">
                <input
                  type="checkbox"
                  checked={allowResend}
                  onChange={(event) => setAllowResend(event.target.checked)}
                />
                Include candidates already notified (resend)
              </label>
            ) : null}
            <ul className="ats-position-filled-list">
              {visibleEligible.map((app) => {
                const checked = !excludedIds.includes(app.id);
                const prior = alreadyNotifiedIds.includes(app.id);
                return (
                  <li key={app.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleId(app.id)}
                      />
                      <span>
                        <strong>{candidateDisplayName(app)}</strong>
                        <em>{app.email}</em>
                        {prior ? <small>Already notified</small> : null}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <div className="status-email-actions">
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!toSend.length}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="pf-subject">Subject</label>
              <input
                id="pf-subject"
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="pf-body">Body</label>
              <textarea
                id="pf-body"
                rows={12}
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />
              <p className="ats-field-hint">
                Placeholders: {'{{candidate_name}}'}, {'{{job_title}}'}, {'{{company_name}}'},{' '}
                {'{{company_email}}'}, {'{{careers_url}}'}
              </p>
              <p className="ats-field-hint">
                Sent as branded HTML with {POSITION_FILLED_COMPANY_EMAIL} in the footer.
              </p>
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="pf-test-to">Send live test to</label>
              <input
                id="pf-test-to"
                type="email"
                value={testTo}
                onChange={(event) => setTestTo(event.target.value)}
                placeholder="applicant@example.com"
              />
              <p className="ats-field-hint">
                Must match an applicant email on this job (e.g. not your personal inbox unless you also applied).
                {testTo && !findApplicantByEmail(testTo) ? (
                  <>
                    {' '}
                    <strong>{testTo}</strong> is not on this job.
                  </>
                ) : null}
              </p>
            </div>
            <div className="status-email-actions">
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)} disabled={busy}>
                Back
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => openMailtoDraft(String(testTo || '').trim())}
                disabled={busy || !String(testTo || '').trim()}
              >
                Open draft
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={sendTestEmail}
                disabled={busy || !findApplicantByEmail(testTo)}
              >
                {busy ? 'Sending…' : 'Send live test'}
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setStep(3)} disabled={busy}>
                Review & confirm
              </button>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className="ats-pf-confirm-hero">
              <div>
                <p className="ats-pf-confirm-count">
                  Ready to send <strong>{toSend.length}</strong> individual
                  {toSend.length === 1 ? ' email' : ' emails'}
                </p>
                <p className="ats-pf-confirm-sub">
                  Names and job details are filled in per person. Hired and withdrawn stay out.
                </p>
              </div>
              <div className="ats-pf-confirm-stat" aria-hidden="true">
                <strong>{toSend.length}</strong>
                <span>to notify</span>
              </div>
            </div>

            <div className="ats-pf-confirm-grid">
              <section className="ats-pf-confirm-panel" aria-labelledby="pf-confirm-people">
                <h3 id="pf-confirm-people">Recipients</h3>
                <ul className="ats-position-filled-list ats-pf-confirm-list">
                  {toSend.map((app) => (
                    <li key={app.id}>
                      <span>
                        <strong>{candidateDisplayName(app)}</strong>
                        <em>{app.email}</em>
                      </span>
                    </li>
                  ))}
                </ul>
                {excludedRecipients.length || alreadySent.length ? (
                  <p className="ats-field-hint" style={{ marginTop: '0.65rem' }}>
                    {excludedRecipients.length
                      ? `${excludedRecipients.length} excluded`
                      : null}
                    {excludedRecipients.length && alreadySent.length ? ' · ' : null}
                    {alreadySent.length ? `${alreadySent.length} already notified` : null}
                  </p>
                ) : null}
              </section>

              <section className="ats-pf-confirm-panel" aria-labelledby="pf-confirm-preview">
                <h3 id="pf-confirm-preview">
                  Email preview
                  {toSend[0] ? (
                    <span> · as {candidateDisplayName(toSend[0])}</span>
                  ) : null}
                </h3>
                <div className="ats-pf-email-preview">
                  <p className="ats-pf-email-subject">
                    <span>Subject</span>
                    {previewSubject || '—'}
                  </p>
                  <iframe
                    title="Email HTML preview"
                    className="ats-pf-email-frame"
                    sandbox=""
                    srcDoc={previewHtml}
                  />
                </div>
              </section>
            </div>

            <div className="ats-pf-confirm-warn" role="note">
              Applicants still in the pipeline will be marked <strong>rejected</strong> when this sends.
            </div>

            <label className="ats-pf-confirm-check">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(event) => setConfirmChecked(event.target.checked)}
              />
              <span>I understand these emails will be sent now.</span>
            </label>

            <div className="status-email-actions">
              <button type="button" className="btn btn-outline" onClick={() => setStep(2)} disabled={busy}>
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy || !confirmChecked || !toSend.length}
                onClick={() => startSend()}
              >
                {busy ? 'Sending…' : `Send ${toSend.length} email${toSend.length === 1 ? '' : 's'}`}
              </button>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <div className="ats-position-filled-summary">
              <span><strong>{counts.sent || 0}</strong> sent</span>
              <span><strong>{counts.failed || 0}</strong> failed</span>
              <span><strong>{counts.excluded || 0}</strong> excluded</span>
              <span><strong>{counts.queued || 0}</strong> queued</span>
            </div>
            {busy ? <p className="ats-field-hint">Sending slowly to avoid email limits… leave this tab open.</p> : null}
            {!busy && campaign?.status === 'paused' ? (
              <p className="ats-toast is-warning">
                {campaign.pauseReason ||
                  'Paused after repeated delivery failures (often Resend quota/rate limit). Remaining applicants stayed queued.'}
              </p>
            ) : null}
            {!busy && campaign?.status !== 'paused' && (counts.queued || 0) > 0 ? (
              <p className="ats-toast is-warning">
                {(counts.queued || 0)} still queued — sending stopped before they were attempted.
              </p>
            ) : null}
            {topFailureReason ? (
              <p className="ats-toast is-error">
                Most common failure ({topFailureReason.count}×): {topFailureReason.message}
              </p>
            ) : null}
            {!busy && (counts.failed || 0) > 50 && (counts.sent || 0) > 0 ? (
              <p className="ats-field-hint">
                Many failures after some successes usually means the email provider hit a daily/rate limit.
                Wait, then resume — do not keep blasting retries.
              </p>
            ) : null}
            <ul className="ats-position-filled-list">
              {(campaign?.recipients || []).map((row) => (
                <li key={row.applicationId}>
                  <span>
                    <strong>{row.name}</strong>
                    <em>{row.email}</em>
                    <small>{row.status}{row.error ? ` · ${row.error}` : ''}</small>
                  </span>
                  {row.status === 'failed' && !busy ? (
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => retryOne(row.applicationId)}>
                      Retry
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="status-email-actions">
              {(counts.queued || 0) > 0 && !busy ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => startSend({ resumeRemaining: true })}
                >
                  Resume remaining ({counts.queued})
                </button>
              ) : null}
              {(counts.failed || 0) > 0 && !busy ? (
                <button type="button" className="btn btn-outline" onClick={() => startSend({ retryFailedOnly: true })}>
                  Retry all failed
                </button>
              ) : null}
              <button type="button" className="btn btn-primary" onClick={onClose} disabled={busy}>
                Done
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
