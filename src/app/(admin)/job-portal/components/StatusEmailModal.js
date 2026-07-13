'use client';

import { useEffect, useState } from 'react';
import { PortalStages } from '../PortalContext';
import { formatDateTime } from '@/lib/job-api/format';
import {
  buildStatusEmailPatch,
  datetimeLocalToIso,
  toDatetimeLocalValue,
} from '@/lib/job-api/email-templates';

export default function StatusEmailModal({
  open,
  application,
  initialFields,
  interviewIso,
  targetStatus,
  isResend = false,
  onClose,
  onSubmit,
  submitting = false,
  error = '',
}) {
  const [emailSubject, setEmailSubject] = useState(initialFields?.emailSubject || '');
  const [emailBody, setEmailBody] = useState(initialFields?.emailBody || '');
  const [interviewAtLocal, setInterviewAtLocal] = useState(
    interviewIso ? toDatetimeLocalValue(interviewIso) : ''
  );
  const [reminderSubject, setReminderSubject] = useState(initialFields?.reminderEmailSubject || '');
  const [reminderBody, setReminderBody] = useState(initialFields?.reminderEmailBody || '');
  const [localError, setLocalError] = useState('');
  const [lastInterviewFormatted, setLastInterviewFormatted] = useState(
    interviewIso ? formatDateTime(interviewIso) : ''
  );

  const isInterview = targetStatus === 'interview';
  const statusLabel = PortalStages.labels[targetStatus] || targetStatus;
  const canSubmit = Boolean(emailSubject.trim() && emailBody.trim());

  useEffect(() => {
    if (!open || !initialFields) return;
    setEmailSubject(initialFields.emailSubject || '');
    setEmailBody(initialFields.emailBody || '');
    setReminderSubject(initialFields.reminderEmailSubject || '');
    setReminderBody(initialFields.reminderEmailBody || '');
    setInterviewAtLocal(interviewIso ? toDatetimeLocalValue(interviewIso) : '');
    setLastInterviewFormatted(interviewIso ? formatDateTime(interviewIso) : '');
    setLocalError('');
  }, [open, initialFields, interviewIso]);

  useEffect(() => {
    if (!open || !isInterview || !interviewAtLocal) return;
    const iso = datetimeLocalToIso(interviewAtLocal);
    if (!iso) return;
    const formatted = formatDateTime(iso);
    if (!lastInterviewFormatted || formatted === lastInterviewFormatted) return;
    setEmailBody((prev) => prev.replaceAll(lastInterviewFormatted, formatted));
    setReminderBody((prev) => prev.replaceAll(lastInterviewFormatted, formatted));
    setLastInterviewFormatted(formatted);
  }, [open, isInterview, interviewAtLocal, lastInterviewFormatted]);

  if (!open || !application || !targetStatus || !initialFields) return null;

  const candidateLabel =
    application.candidateName || application.email || 'Candidate';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!emailSubject.trim() || !emailBody.trim()) {
      setLocalError('Email subject and body are required.');
      return;
    }

    let nextInterviewAtIso = '';
    if (isInterview) {
      nextInterviewAtIso = datetimeLocalToIso(interviewAtLocal);
      if (!interviewAtLocal || !nextInterviewAtIso) {
        setLocalError('Please choose a valid interview date and time.');
        return;
      }
      if (new Date(nextInterviewAtIso).getTime() <= Date.now()) {
        setLocalError('Interview time must be in the future.');
        return;
      }
      if (!reminderSubject.trim() || !reminderBody.trim()) {
        setLocalError('Reminder email subject and body are required for interviews.');
        return;
      }
    }

    const payload = buildStatusEmailPatch({
      status: targetStatus,
      emailSubject,
      emailBody,
      interviewAt: nextInterviewAtIso,
      reminderEmailSubject: reminderSubject,
      reminderEmailBody: reminderBody,
    });

    await onSubmit(payload);
  };

  return (
    <div className="status-email-overlay" role="presentation" onClick={onClose}>
      <div
        className="status-email-dialog ats-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-email-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="status-email-dialog-head">
          <div>
            <h2 id="status-email-title">{isResend ? 'Resend status email' : 'Send status email'}</h2>
            <p className="ats-field-hint">
              {isResend ? (
                <>
                  Resend the <strong>{statusLabel}</strong> notification to{' '}
                  <strong>{candidateLabel}</strong>. Status stays unchanged.
                </>
              ) : targetStatus === 'hired' ? (
                <>
                  Hiring <strong>{candidateLabel}</strong>. Every other applicant for this job
                  will be rejected and emailed, and the job posting will be closed.
                </>
              ) : (
                <>
                  Moving <strong>{candidateLabel}</strong> to{' '}
                  <strong>{statusLabel}</strong>. The candidate receives this email when you confirm.
                </>
              )}
            </p>
          </div>
          <button type="button" className="status-email-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ats-field">
            <label className="ats-field-label" htmlFor="status-email-subject">Email subject</label>
            <input
              id="status-email-subject"
              required
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="ats-field">
            <label className="ats-field-label" htmlFor="status-email-body">Email body</label>
            <textarea
              id="status-email-body"
              rows={10}
              required
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              disabled={submitting}
            />
            <p className="ats-field-hint">Plain text. Edit before sending.</p>
          </div>

          {isInterview ? (
            <fieldset className="status-email-fieldset">
              <legend>Interview details</legend>
              <div className="ats-field">
                <label className="ats-field-label" htmlFor="status-email-interview-at">
                  Interview date & time
                </label>
                <input
                  id="status-email-interview-at"
                  type="datetime-local"
                  required
                  value={interviewAtLocal}
                  onChange={(e) => setInterviewAtLocal(e.target.value)}
                  disabled={submitting}
                />
                <p className="ats-field-hint">
                  A reminder email is sent automatically about 24 hours before this time.
                </p>
              </div>

              <div className="ats-field">
                <label className="ats-field-label" htmlFor="status-email-reminder-subject">
                  Reminder email subject
                </label>
                <input
                  id="status-email-reminder-subject"
                  required
                  value={reminderSubject}
                  onChange={(e) => setReminderSubject(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="ats-field">
                <label className="ats-field-label" htmlFor="status-email-reminder-body">
                  Reminder email body
                </label>
                <textarea
                  id="status-email-reminder-body"
                  rows={8}
                  required
                  value={reminderBody}
                  onChange={(e) => setReminderBody(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </fieldset>
          ) : null}

          {localError || error ? (
            <div className="status-email-error" role="alert">
              {localError || error}
            </div>
          ) : null}

          <div className="status-email-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !canSubmit}
            >
              {submitting
                ? 'Sending…'
                : isResend
                  ? 'Resend email'
                  : targetStatus === 'hired'
                    ? 'Hire, notify others & close job'
                    : 'Update status & send email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
