'use client';

import { useEffect, useMemo, useState } from 'react';
import CustomSelect from '@/components/CustomSelect';
import CustomDatePicker from '@/components/CustomDatePicker';
import { PortalStages } from '../PortalContext';
import { formatDateTime } from '@/lib/job-api/format';
import {
  buildSilentStatusPatch,
  buildStatusEmailPatch,
  datetimeLocalToIso,
  findUnresolvedEmailPlaceholders,
  getInterviewSendBlockers,
  setLabeledValue,
} from '@/lib/job-api/email-templates';
import {
  INTERVIEW_FORMAT_OPTIONS,
  INTERVIEW_SLOT_PLACEHOLDERS,
  buildHourOptions,
  buildMinuteOptions,
  interviewSlotToLocal,
  isoToInterviewSlot,
  locationFieldCopy,
  minSelectableDateValue,
  parseInterviewFormat,
  parseInterviewLocation,
} from '@/lib/job-api/interview-slot';

function PlaceholderPreview({ text }) {
  const parts = String(text || '').split(/(\{\{\w+\}\}|\[[^\[\]]+\])/g);
  return (
    <div className="ats-placeholder-preview">
      {parts.map((part, index) =>
        findUnresolvedEmailPlaceholders(part).includes(part) ? (
          <mark key={`${part}-${index}`}>{part}</mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </div>
  );
}

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
  bulkCount = 1,
}) {
  const [emailSubject, setEmailSubject] = useState(initialFields?.emailSubject || '');
  const [emailBody, setEmailBody] = useState(initialFields?.emailBody || '');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewHour, setInterviewHour] = useState('');
  const [interviewMinute, setInterviewMinute] = useState('');
  const [interviewFormat, setInterviewFormat] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [slotReady, setSlotReady] = useState(false);
  const [reminderSubject, setReminderSubject] = useState(initialFields?.reminderEmailSubject || '');
  const [reminderBody, setReminderBody] = useState(initialFields?.reminderEmailBody || '');
  const [localError, setLocalError] = useState('');
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  const [interviewTouched, setInterviewTouched] = useState(false);
  const [initialInterviewIso, setInitialInterviewIso] = useState(interviewIso || '');
  const [step, setStep] = useState(1);
  const [notify, setNotify] = useState(true);
  const [showReminder, setShowReminder] = useState(false);

  const isInterview = targetStatus === 'interview';
  const statusLabel = PortalStages.labels[targetStatus] || targetStatus;
  const unresolvedPlaceholders = findUnresolvedEmailPlaceholders(
    emailBody,
    isInterview ? reminderBody : ''
  );
  const interviewAtLocal = interviewSlotToLocal(interviewDate, interviewHour, interviewMinute);
  const interviewIsoNow = datetimeLocalToIso(interviewAtLocal);
  const interviewBlockers = useMemo(
    () =>
      isInterview
        ? getInterviewSendBlockers({
            emailBody,
            reminderBody,
            interviewAtIso: interviewIsoNow,
            interviewTouched,
            initialInterviewIso,
            isResend,
          })
        : [],
    [
      isInterview,
      emailBody,
      reminderBody,
      interviewIsoNow,
      interviewTouched,
      initialInterviewIso,
      isResend,
    ]
  );
  const canSubmit = Boolean(
    emailSubject.trim() &&
      emailBody.trim() &&
      unresolvedPlaceholders.length === 0 &&
      interviewBlockers.length === 0 &&
      (!isInterview ||
        (interviewAtLocal &&
          reminderSubject.trim() &&
          reminderBody.trim()))
  );
  const blockerSummary = interviewBlockers
    .map((item) => `${item.field}: ${item.message}`)
    .join(' ');
  const hourOptions = useMemo(() => buildHourOptions(interviewDate), [open, interviewDate]);
  const minuteOptions = useMemo(
    () => buildMinuteOptions(interviewDate, interviewHour),
    [open, interviewDate, interviewHour]
  );
  const locationCopy = locationFieldCopy(interviewFormat);
  const dateBlocked = showFieldErrors && interviewBlockers.some((item) => item.field === 'Date & time');
  const formatBlocked = showFieldErrors && interviewBlockers.some((item) => item.field === 'Format');
  const locationBlocked = showFieldErrors && interviewBlockers.some((item) => item.field === 'Location or link');
  const missingSummary = isInterview && !canSubmit
    ? 'Add a date, time, format, and location before sending.'
    : '';

  useEffect(() => {
    if (!open || !initialFields) {
      setSlotReady(false);
      return;
    }
    setEmailSubject(initialFields.emailSubject || '');
    setEmailBody(initialFields.emailBody || '');
    setReminderSubject(initialFields.reminderEmailSubject || '');
    setReminderBody(initialFields.reminderEmailBody || '');
    setInitialInterviewIso(interviewIso || '');
    setInterviewTouched(false);
    setLocalError('');
    setShowFieldErrors(false);
    setStep(isResend ? 2 : 1);
    setNotify(isResend || ['interview', 'rejected', 'hired'].includes(targetStatus));
    setShowReminder(false);

    if (isInterview && isResend && interviewIso) {
      const slot = isoToInterviewSlot(interviewIso);
      const slotIso = datetimeLocalToIso(interviewSlotToLocal(slot.date, slot.hour, slot.minute));
      const inFuture = slotIso && new Date(slotIso).getTime() > Date.now();
      if (inFuture) {
        setInterviewDate(slot.date);
        setInterviewHour(slot.hour);
        setInterviewMinute(slot.minute);
      } else {
        setInterviewDate('');
        setInterviewHour('');
        setInterviewMinute('');
      }
      setInterviewFormat(parseInterviewFormat(initialFields.emailBody));
      setInterviewLocation(parseInterviewLocation(initialFields.emailBody));
    } else {
      setInterviewDate('');
      setInterviewHour('');
      setInterviewMinute('');
      setInterviewFormat('');
      setInterviewLocation('');
    }
    setSlotReady(true);
  }, [open, initialFields, interviewIso, isInterview, isResend, targetStatus]);

  useEffect(() => {
    if (!open || !isInterview || !slotReady) return;

    const formatted = interviewIsoNow
      ? formatDateTime(interviewIsoNow)
      : INTERVIEW_SLOT_PLACEHOLDERS.datetime;
    const formatLabel = interviewFormat || INTERVIEW_SLOT_PLACEHOLDERS.format;
    const locationLabel = interviewLocation.trim() || locationCopy.bodyValue;

    const applySlotLines = (prev) => {
      let next = prev;
      next = setLabeledValue(next, 'Date & time', formatted);
      next = setLabeledValue(next, 'Format', formatLabel);
      next = setLabeledValue(next, 'Location or link', locationLabel);
      return next;
    };

    setEmailBody((prev) => applySlotLines(prev));
    setReminderBody((prev) => applySlotLines(prev));
  }, [
    open,
    isInterview,
    slotReady,
    interviewIsoNow,
    interviewFormat,
    interviewLocation,
    locationCopy.bodyValue,
  ]);

  if (!open || !application || !targetStatus || !initialFields) return null;

  const candidateLabel = application.candidateName || application.email || 'Candidate';

  const markInterviewTouched = () => setInterviewTouched(true);

  const handleDateChange = (nextDate) => {
    if (nextDate && nextDate < minSelectableDateValue()) return;
    markInterviewTouched();
    setInterviewDate(nextDate);
    const nextHours = buildHourOptions(nextDate);
    if (!nextHours.some((opt) => opt.value === interviewHour)) {
      setInterviewHour('');
      setInterviewMinute('');
      return;
    }
    const nextMinutes = buildMinuteOptions(nextDate, interviewHour);
    if (!nextMinutes.some((opt) => opt.value === interviewMinute)) {
      setInterviewMinute('');
    }
  };

  const handleHourChange = (nextHour) => {
    markInterviewTouched();
    setInterviewHour(nextHour);
    const nextMinutes = buildMinuteOptions(interviewDate, nextHour);
    if (!nextMinutes.some((opt) => opt.value === interviewMinute)) {
      setInterviewMinute('');
    }
  };

  const handleBlockedSubmit = () => {
    setShowFieldErrors(true);
    setLocalError(
      interviewBlockers[0]?.message || 'Add the missing interview details before sending.'
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!notify && !isResend) {
      const interviewAt = isInterview && interviewIsoNow ? interviewIsoNow : undefined;
      await onSubmit({
        ...buildSilentStatusPatch({ status: targetStatus, interviewAt }),
        send_email: false,
      });
      return;
    }

    if (step === 1) {
      if (isInterview && interviewBlockers.length) {
        handleBlockedSubmit();
        return;
      }
      setStep(2);
      return;
    }

    if (!emailSubject.trim() || !emailBody.trim()) {
      setLocalError('Add a subject and message before sending.');
      return;
    }

    const unresolved = findUnresolvedEmailPlaceholders(
      emailBody,
      isInterview ? reminderBody : ''
    );
    if (unresolved.length) {
      setLocalError('Replace the unfinished details in the message before sending.');
      return;
    }

    let nextInterviewAtIso = '';
    if (isInterview) {
      nextInterviewAtIso = interviewIsoNow;
      if (interviewBlockers.length) {
        handleBlockedSubmit();
        return;
      }
      if (!interviewAtLocal || !nextInterviewAtIso) {
        setShowFieldErrors(true);
        setLocalError('Choose a date and time before sending.');
        return;
      }
      if (new Date(nextInterviewAtIso).getTime() <= Date.now()) {
        setShowFieldErrors(true);
        setLocalError('Choose a time that has not already passed.');
        return;
      }
      if (!reminderSubject.trim() || !reminderBody.trim()) {
        setLocalError('Add a subject and message for the reminder.');
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
            <h2 id="status-email-title">
              {isResend ? 'Resend status email' : `Move to ${statusLabel}`}
            </h2>
            <p className="ats-field-hint">
              {isResend ? (
                <>
                  Resend the <strong>{statusLabel}</strong> notification to{' '}
                  <strong>{candidateLabel}</strong>. Status stays unchanged.
                </>
              ) : (
                <>
                  Step {step} of {notify ? 2 : 1}. Update <strong>{candidateLabel}</strong> to{' '}
                  <strong>{statusLabel}</strong>
                  {bulkCount > 1 ? ` and ${bulkCount - 1} more` : ''}.
                </>
              )}
            </p>
          </div>
          <button type="button" className="status-email-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          onInvalid={(e) => {
            e.preventDefault();
            handleBlockedSubmit();
          }}
        >
          {!isResend && step === 1 ? (
            <label className="ats-notify-toggle">
              <input
                type="checkbox"
                checked={notify}
                onChange={(event) => setNotify(event.target.checked)}
                disabled={submitting}
              />
              <span>Notify candidate via email</span>
            </label>
          ) : null}

          {isInterview && notify && step === 1 ? (
            <fieldset className="status-email-fieldset interview-slot-fields">
              <legend>Interview details</legend>
              <div className="interview-slot-grid">
                <div className="ats-field">
                  <label className="ats-field-label" htmlFor="status-email-interview-date">
                    Date
                  </label>
                  <CustomDatePicker
                    id="status-email-interview-date"
                    value={interviewDate}
                    onChange={handleDateChange}
                    placeholder="Select date"
                    disabled={submitting}
                    className={dateBlocked ? 'is-blocked-field' : ''}
                  />
                  <p className="ats-field-hint">Today or a later day.</p>
                </div>

                <div className="ats-field">
                  <label className="ats-field-label" htmlFor="status-email-interview-hour">
                    Time
                  </label>
                  <div className="interview-slot-time">
                    <CustomSelect
                      id="status-email-interview-hour"
                      value={interviewHour}
                      onChange={handleHourChange}
                      options={hourOptions}
                      placeholder="Hour"
                      disabled={submitting || !interviewDate}
                      className={dateBlocked ? 'is-blocked-field' : ''}
                    />
                    <span className="interview-slot-time-sep" aria-hidden="true">
                      :
                    </span>
                    <CustomSelect
                      id="status-email-interview-minute"
                      value={interviewMinute}
                      onChange={(nextMinute) => {
                        markInterviewTouched();
                        setInterviewMinute(nextMinute);
                      }}
                      options={minuteOptions}
                      placeholder="Min"
                      disabled={submitting || !interviewDate || !interviewHour}
                      className={dateBlocked ? 'is-blocked-field' : ''}
                    />
                  </div>
                  <p className="ats-field-hint">24-hour time. Past times today are hidden.</p>
                </div>

                <div className="ats-field">
                  <label className="ats-field-label" htmlFor="status-email-interview-format">
                    Format
                  </label>
                  <CustomSelect
                    id="status-email-interview-format"
                    value={interviewFormat}
                    onChange={(nextFormat) => {
                      markInterviewTouched();
                      setInterviewFormat(nextFormat);
                    }}
                    options={INTERVIEW_FORMAT_OPTIONS}
                    placeholder="Select format"
                    disabled={submitting}
                    className={formatBlocked ? 'is-blocked-field' : ''}
                  />
                </div>

                <div className="ats-field">
                  <label className="ats-field-label" htmlFor="status-email-interview-location">
                    {locationCopy.label}
                  </label>
                  <input
                    id="status-email-interview-location"
                    type="text"
                    value={interviewLocation}
                    onChange={(e) => {
                      markInterviewTouched();
                      setInterviewLocation(e.target.value);
                    }}
                    placeholder={locationCopy.placeholder}
                    disabled={submitting}
                    autoComplete="off"
                    className={locationBlocked ? 'is-blocked-field' : undefined}
                  />
                </div>
              </div>
            </fieldset>
          ) : null}

          {step === 2 ? (
          <>
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
              className={
                interviewBlockers.some((item) =>
                  ['Date & time', 'Format', 'Location or link'].includes(item.field)
                )
                  ? 'is-blocked-field'
                  : undefined
              }
            />
            <p className="ats-field-hint">
              Date &amp; time, Format, and Location or link update from the choices above.
            </p>
            {unresolvedPlaceholders.length ? (
              <div className="ats-placeholder-list">
                {unresolvedPlaceholders.map((token) => (
                  <mark key={token}>{token}</mark>
                ))}
              </div>
            ) : null}
            {emailBody ? <PlaceholderPreview text={emailBody} /> : null}
          </div>

          {isInterview ? (
            <div className="ats-reminder-toggle">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowReminder((open) => !open)}>
                {showReminder ? 'Hide reminder email' : 'Add reminder email'}
              </button>
            </div>
          ) : null}

          {isInterview && showReminder ? (
            <fieldset className="status-email-fieldset">
              <legend>Reminder</legend>
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
                  className={
                    interviewBlockers.some((item) => item.field.startsWith('Reminder'))
                      ? 'is-blocked-field'
                      : undefined
                  }
                />
                <p className="ats-field-hint">
                  Reminder Date &amp; time, Format, and Location or link copy from the interview details above.
                </p>
              </div>
            </fieldset>
          ) : null}
          </>
          ) : null}

          {localError || error ? (
            <div className="status-email-error" role="alert">
              {(localError || error).split('\n').map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          ) : null}

          <div className="status-email-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            {step === 2 && !isResend ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setStep(1)}
                disabled={submitting}
              >
                Back
              </button>
            ) : null}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                submitting ||
                (step === 2 && notify && !canSubmit) ||
                (step === 1 && notify && isInterview && interviewBlockers.length > 0)
              }
              title={!canSubmit ? blockerSummary || 'Add the missing details before sending.' : undefined}
              aria-describedby={!canSubmit && missingSummary ? 'status-email-send-why' : undefined}
            >
              {submitting
                ? 'Saving…'
                : !notify && !isResend
                  ? 'Update stage'
                  : step === 1
                    ? 'Continue'
                    : isResend
                      ? 'Resend email'
                      : 'Send email'}
            </button>
          </div>
          {!canSubmit && missingSummary ? (
            <p id="status-email-send-why" className="status-email-send-why">
              {missingSummary}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
