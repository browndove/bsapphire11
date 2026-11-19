/** Position-filled notification helpers — pure logic, safe for Node tests. */

export const POSITION_FILLED_STATUS = 'rejected';

export const POSITION_FILLED_COMPANY_EMAIL = 'info@blvcksapphire.com';
export const POSITION_FILLED_COMPANY_SITE = 'https://blvcksapphire.com';
export const POSITION_FILLED_CAREERS_URL = 'https://blvcksapphire.com/careers';

export const POSITION_FILLED_DEFAULT_SUBJECT =
  'Update on your application for {{job_title}} at {{company_name}}';

export const POSITION_FILLED_DEFAULT_BODY = `Hi {{candidate_name}},

Thank you for applying for the {{job_title}} position at {{company_name}} and for the time you put into your application.

We have now selected a candidate for this role. We were grateful for your interest, and we encourage you to keep an eye on our open positions and apply for future roles that match your skills.

Browse open roles: {{careers_url}}

We wish you every success.

The {{company_name}} Hiring Team
{{company_email}}`;

/** Space sends out — Resend quotas fail fast when blasting hundreds at 400ms. */
export const POSITION_FILLED_SEND_GAP_MS = 1200;
export const POSITION_FILLED_MAX_CONSECUTIVE_FAILURES = 8;

export function isLikelyEmailDeliveryFailure(message) {
  const text = String(message || '').toLowerCase();
  return (
    text.includes('failed to send email') ||
    text.includes('email was not delivered') ||
    text.includes('email is not configured') ||
    text.includes('rate limit') ||
    text.includes('too many') ||
    text.includes('quota') ||
    text.includes('temporarily unavailable')
  );
}

export function resolvePublicCareersUrl(preferred) {
  const raw = String(preferred || '').trim();
  if (!raw) return POSITION_FILLED_CAREERS_URL;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(raw)) {
    return POSITION_FILLED_CAREERS_URL;
  }
  if (raw.startsWith('/')) {
    return `${POSITION_FILLED_COMPANY_SITE}${raw}`;
  }
  return raw;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function linkifyPlainLine(line, careersUrl) {
  const trimmed = String(line || '').trim();
  const browseMatch = trimmed.match(/^Browse open roles:\s*(.*)$/i);
  if (browseMatch) {
    const href = escapeHtml(resolvePublicCareersUrl(browseMatch[1] || careersUrl));
    return `<p style="margin:0 0 20px;"><a href="${href}" style="display:inline-block;padding:12px 22px;background:#111111;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">Browse open roles</a></p>`;
  }

  const emailMatch = trimmed.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i);
  if (emailMatch) {
    const email = escapeHtml(trimmed);
    return `<p style="margin:0 0 8px;font-size:14px;"><a href="mailto:${email}" style="color:#444444;text-decoration:underline;">${email}</a></p>`;
  }

  const withUrls = escapeHtml(trimmed).replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" style="color:#111111;text-decoration:underline;">$1</a>'
  );
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#222222;">${withUrls}</p>`;
}

/** Turn recruiter plain-text body into simple HTML blocks. */
export function plainEmailBodyToHtml(bodyText, { careersUrl } = {}) {
  const text = String(bodyText || '').replace(/\r\n/g, '\n').trim();
  if (!text) return '';
  return text
    .split(/\n{2,}/)
    .map((block) =>
      block
        .split('\n')
        .map((line) => linkifyPlainLine(line, careersUrl))
        .join('')
    )
    .join('');
}

/** Branded HTML wrapper for candidate emails (inline styles for clients). */
export function buildBrandedCandidateEmailHtml({
  companyName = 'Blvck Sapphire',
  companyEmail = POSITION_FILLED_COMPANY_EMAIL,
  companySite = POSITION_FILLED_COMPANY_SITE,
  careersUrl = POSITION_FILLED_CAREERS_URL,
  bodyHtml = '',
} = {}) {
  const name = escapeHtml(companyName);
  const email = escapeHtml(companyEmail);
  const site = escapeHtml(companySite);
  const careers = escapeHtml(resolvePublicCareersUrl(careersUrl));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${name}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;color:#222222;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:22px 28px;background:#111111;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
              <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.72;margin-bottom:6px;">Careers</div>
              <div style="font-size:20px;font-weight:700;letter-spacing:-0.02em;">${name}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 24px;border-top:1px solid #eeeeee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:#666666;">
              <div style="font-weight:600;color:#222222;margin-bottom:4px;">${name}</div>
              <div><a href="mailto:${email}" style="color:#444444;text-decoration:underline;">${email}</a></div>
              <div style="margin-top:4px;">
                <a href="${site}" style="color:#444444;text-decoration:underline;">${site.replace(/^https?:\/\//, '')}</a>
                &nbsp;·&nbsp;
                <a href="${careers}" style="color:#444444;text-decoration:underline;">Open roles</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildPositionFilledEmailHtml(bodyText, context = {}) {
  const careersUrl = resolvePublicCareersUrl(context.careers_url);
  const bodyHtml = plainEmailBodyToHtml(bodyText, { careersUrl });
  return buildBrandedCandidateEmailHtml({
    companyName: context.company_name || 'Blvck Sapphire',
    companyEmail: context.company_email || POSITION_FILLED_COMPANY_EMAIL,
    companySite: context.company_site || POSITION_FILLED_COMPANY_SITE,
    careersUrl,
    bodyHtml,
  });
}

export function candidateDisplayName(application) {
  if (!application) return 'there';
  const composed = [
    application.firstName || application.candidate_first_name || '',
    application.lastName || application.candidate_last_name || '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
  return (
    application.candidateName ||
    composed ||
    (application.email ? String(application.email).split('@')[0] : '') ||
    'there'
  );
}

export function buildPositionFilledContext(application, job, companyName, careersUrl) {
  const name = candidateDisplayName(application);
  return {
    candidate_name: name,
    first_name: application?.firstName || name.split(/\s+/)[0] || 'there',
    last_name: application?.lastName || name.split(/\s+/).slice(1).join(' ') || '',
    job_title: job?.title || application?.jobTitle || 'this role',
    company_name: companyName || application?.companyName || 'Blvck Sapphire',
    company_email: POSITION_FILLED_COMPANY_EMAIL,
    company_site: POSITION_FILLED_COMPANY_SITE,
    careers_url: resolvePublicCareersUrl(careersUrl),
  };
}

export function getPositionFilledDefaults(application, job, companyName, careersUrl) {
  const context = buildPositionFilledContext(application, job, companyName, careersUrl);
  const apply = (text) =>
    String(text || '').replace(/\{\{(\w+)\}\}/g, (_, key) =>
      context[key] != null ? String(context[key]) : `{{${key}}}`
    );

  return {
    emailSubject: apply(POSITION_FILLED_DEFAULT_SUBJECT),
    emailBody: apply(POSITION_FILLED_DEFAULT_BODY),
    context,
  };
}

/** Draft text keeps {{tokens}} so each recipient can be filled at send time. */
export function getPositionFilledDraftFields(_job, _companyName, _careersUrl) {
  return {
    emailSubject: POSITION_FILLED_DEFAULT_SUBJECT,
    emailBody: POSITION_FILLED_DEFAULT_BODY,
  };
}

/**
 * Default recipients: everyone on the job except hired ("selected") and withdrawn.
 * Applications without an email are returned separately as undeliverable.
 */
export function selectPositionFilledRecipients(applications = []) {
  const eligible = [];
  const skipped = [];

  for (const app of applications) {
    const status = String(app?.status || '').toLowerCase();
    if (status === 'hired') {
      skipped.push({ application: app, reason: 'selected' });
      continue;
    }
    if (status === 'withdrawn') {
      skipped.push({ application: app, reason: 'withdrawn' });
      continue;
    }
    if (!app?.email) {
      skipped.push({ application: app, reason: 'no_email' });
      continue;
    }
    eligible.push(app);
  }

  return { eligible, skipped };
}

/**
 * Apply checkbox exclusions and duplicate prevention.
 * @param {object} options
 * @param {Array} options.eligible - from selectPositionFilledRecipients
 * @param {string[]} options.excludedIds - manually unchecked for this send
 * @param {Set<string>|string[]} options.alreadyNotifiedIds - prior successful sends for this job
 * @param {boolean} options.allowResend - include already-notified when user opts in
 */
export function resolvePositionFilledSendList({
  eligible = [],
  excludedIds = [],
  alreadyNotifiedIds = [],
  allowResend = false,
} = {}) {
  const excluded = new Set(excludedIds.filter(Boolean));
  const notified = alreadyNotifiedIds instanceof Set
    ? alreadyNotifiedIds
    : new Set(alreadyNotifiedIds.filter(Boolean));

  const toSend = [];
  const excludedRecipients = [];
  const alreadySent = [];

  for (const app of eligible) {
    if (excluded.has(app.id)) {
      excludedRecipients.push(app);
      continue;
    }
    if (notified.has(app.id) && !allowResend) {
      alreadySent.push(app);
      continue;
    }
    toSend.push(app);
  }

  return { toSend, excludedRecipients, alreadySent };
}

export function assertCanNotifyPositionFilled(job, { isAuthed = true, isEmployer = true } = {}) {
  if (!isAuthed || !isEmployer) {
    const err = new Error('Only signed-in employers can notify applicants.');
    err.code = 'forbidden';
    err.status = 403;
    throw err;
  }
  if (!job?.id) {
    const err = new Error('Job not found.');
    err.code = 'not_found';
    err.status = 404;
    throw err;
  }
  if (String(job.status || '').toLowerCase() !== 'closed') {
    const err = new Error('This action is only available after the job is closed.');
    err.code = 'job_not_closed';
    err.status = 409;
    throw err;
  }
  return true;
}

export function summarizeCampaignRecipients(recipients = []) {
  const counts = { queued: 0, sent: 0, failed: 0, excluded: 0 };
  for (const row of recipients) {
    const key = row?.status;
    if (key && counts[key] != null) counts[key] += 1;
  }
  return counts;
}

export function buildPositionFilledStatusPatch({ emailSubject, emailBody, emailHtml }) {
  const subject = String(emailSubject || '').trim();
  const body = String(emailBody || '').trim();
  if (!subject || !body) {
    throw new Error('Email subject and body are required.');
  }
  const patch = {
    status: POSITION_FILLED_STATUS,
    send_email: true,
    email_subject: subject,
    email_body: body,
  };
  const html = String(emailHtml || '').trim();
  if (html) {
    patch.email_html = html;
  }
  return patch;
}
