import {
  POSITION_FILLED_MAX_CONSECUTIVE_FAILURES,
  POSITION_FILLED_SEND_GAP_MS,
  isLikelyEmailDeliveryFailure,
  summarizeCampaignRecipients,
} from './position-filled';

const CAMPAIGNS_KEY = 'ats-position-filled-campaigns';

function readAll() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CAMPAIGNS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(all) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(all));
}

export function readPositionFilledCampaign(jobId) {
  if (!jobId) return null;
  return readAll()[jobId] || null;
}

export function listNotifiedApplicationIds(jobId) {
  const campaign = readPositionFilledCampaign(jobId);
  if (!campaign?.recipients) return [];
  return campaign.recipients
    .filter((row) => row.status === 'sent')
    .map((row) => row.applicationId);
}

export function createPositionFilledCampaign({
  jobId,
  jobTitle,
  sentBy,
  subject,
  body,
  toSend = [],
  excluded = [],
}) {
  const now = new Date().toISOString();
  const previous = readPositionFilledCampaign(jobId);
  const touched = new Set([
    ...toSend.map((app) => app.id),
    ...excluded.map((app) => app.id),
  ]);

  const preserved = (previous?.recipients || []).filter(
    (row) => row.status === 'sent' && !touched.has(row.applicationId)
  );

  const recipients = [
    ...preserved,
    ...toSend.map((app) => ({
      applicationId: app.id,
      name: app.candidateName || app.email || 'Applicant',
      email: app.email || '',
      status: 'queued',
      updatedAt: now,
      error: '',
    })),
    ...excluded.map((app) => ({
      applicationId: app.id,
      name: app.candidateName || app.email || 'Applicant',
      email: app.email || '',
      status: 'excluded',
      updatedAt: now,
      error: '',
    })),
  ];

  const campaign = {
    jobId,
    jobTitle: jobTitle || '',
    sentBy: sentBy || '',
    subject,
    body,
    createdAt: previous?.createdAt || now,
    updatedAt: now,
    status: 'running',
    pauseReason: '',
    recipients,
    counts: summarizeCampaignRecipients(recipients),
  };

  const all = readAll();
  all[jobId] = campaign;
  writeAll(all);
  return campaign;
}

export function updateCampaignRecipient(jobId, applicationId, patch) {
  const all = readAll();
  const campaign = all[jobId];
  if (!campaign) return null;
  const nextRecipients = campaign.recipients.map((row) =>
    row.applicationId === applicationId
      ? { ...row, ...patch, updatedAt: new Date().toISOString() }
      : row
  );
  const next = {
    ...campaign,
    recipients: nextRecipients,
    counts: summarizeCampaignRecipients(nextRecipients),
    updatedAt: new Date().toISOString(),
  };
  all[jobId] = next;
  writeAll(all);
  return next;
}

export function finishCampaign(jobId, status = 'completed', pauseReason = '') {
  const all = readAll();
  const campaign = all[jobId];
  if (!campaign) return null;
  const next = {
    ...campaign,
    status,
    pauseReason: status === 'paused' ? pauseReason || campaign.pauseReason || '' : '',
    updatedAt: new Date().toISOString(),
    counts: summarizeCampaignRecipients(campaign.recipients),
  };
  all[jobId] = next;
  writeAll(all);
  return next;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Rate-limited sequential sender.
 * Stops early (paused, remaining stay queued) after repeated delivery failures
 * so we do not keep marking applicants rejected while Resend is out of quota.
 */
export async function runPositionFilledCampaign({
  jobId,
  applications,
  sendOne,
  gapMs = POSITION_FILLED_SEND_GAP_MS,
  maxConsecutiveFailures = POSITION_FILLED_MAX_CONSECUTIVE_FAILURES,
  onProgress,
  onlyFailed = false,
}) {
  const campaign = readPositionFilledCampaign(jobId);
  if (!campaign) throw new Error('No campaign found for this job.');

  const byId = new Map(applications.map((app) => [app.id, app]));
  const queue = campaign.recipients.filter((row) =>
    onlyFailed ? row.status === 'failed' : row.status === 'queued' || row.status === 'failed'
  );

  let latest = campaign;
  let consecutiveDeliveryFailures = 0;

  for (let i = 0; i < queue.length; i += 1) {
    const row = queue[i];
    const app = byId.get(row.applicationId);
    if (!app) {
      latest = updateCampaignRecipient(jobId, row.applicationId, {
        status: 'failed',
        error: 'Application no longer available.',
      });
      onProgress?.(latest);
      continue;
    }

    latest = updateCampaignRecipient(jobId, row.applicationId, {
      status: 'queued',
      error: '',
    });
    onProgress?.(latest);

    try {
      const result = await sendOne(app);
      if (result?.ok === false) {
        throw new Error(result.error || 'Send failed.');
      }
      consecutiveDeliveryFailures = 0;
      latest = updateCampaignRecipient(jobId, row.applicationId, {
        status: 'sent',
        error: '',
      });
    } catch (err) {
      const message = err?.message || 'Send failed.';
      latest = updateCampaignRecipient(jobId, row.applicationId, {
        status: 'failed',
        error: message,
      });
      if (isLikelyEmailDeliveryFailure(message)) {
        consecutiveDeliveryFailures += 1;
      } else {
        consecutiveDeliveryFailures = 0;
      }
    }
    onProgress?.(latest);

    if (consecutiveDeliveryFailures >= maxConsecutiveFailures) {
      return finishCampaign(
        jobId,
        'paused',
        `Paused after ${consecutiveDeliveryFailures} email delivery failures in a row. Remaining applicants stayed queued — wait and resume later (often a Resend quota/rate limit).`
      );
    }

    if (i < queue.length - 1) {
      const backoff =
        consecutiveDeliveryFailures > 0
          ? gapMs * Math.min(1 + consecutiveDeliveryFailures, 5)
          : gapMs;
      await sleep(backoff);
    }
  }

  return finishCampaign(jobId, 'completed');
}
