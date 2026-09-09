import { formatDateTime } from './format';

const TEMPLATES = {
  reviewing: {
    subject: 'Update on your application — {{job_title}}',
    body: `Hi {{first_name}},

Thank you again for applying for the {{job_title}} role at {{company_name}}.

Our team is now reviewing your application. We will contact you if we need any additional information.

Best regards,
The {{company_name}} Hiring Team`,
  },
  shortlisted: {
    subject: "You've been shortlisted — {{job_title}}",
    body: `Hi {{first_name}},

Good news — you have been shortlisted for the {{job_title}} position at {{company_name}}.

We were impressed with your application and will be in touch soon about next steps.

Best regards,
The {{company_name}} Hiring Team`,
  },
  interview: {
    subject: 'Interview invitation — {{job_title}}',
    body: `Hi {{first_name}},

We would like to invite you to an interview for the {{job_title}} role at {{company_name}}.

Date & time: Select date & time
Format: Select format
Location or link: Select location

Please reply to this email if you need to reschedule.

Best regards,
The {{company_name}} Hiring Team`,
    reminderSubject: 'Reminder: Interview tomorrow — {{job_title}}',
    reminderBody: `Hi {{first_name}},

This is a friendly reminder about your upcoming interview for {{job_title}} at {{company_name}}.

Date & time: Select date & time
Format: Select format
Location or link: Select location

We look forward to speaking with you.

Best regards,
The {{company_name}} Hiring Team`,
  },
  rejected: {
    subject: 'Update on your application — {{job_title}}',
    body: `Hi {{first_name}},

Thank you for your interest in the {{job_title}} role at {{company_name}} and for the time you invested in your application.

After careful consideration, we will not be moving forward with your application at this time. We encourage you to apply for future openings that match your experience.

We wish you all the best in your job search.

Best regards,
The {{company_name}} Hiring Team`,
  },
  hired: {
    subject: 'Offer — {{job_title}} at {{company_name}}',
    body: `Hi {{first_name}},

We are pleased to offer you the {{job_title}} position at {{company_name}}.

A member of our team will contact you shortly with formal offer details and next steps.

Congratulations, and welcome aboard!

Best regards,
The {{company_name}} Hiring Team`,
  },
};

export function applyEmailPlaceholders(text, context) {
  if (!text) return '';
  return String(text).replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = context[key];
    return value != null ? String(value) : '';
  });
}

/** Bracket/mustache fill-ins that still need editing before send. */
export function findUnresolvedEmailPlaceholders(...texts) {
  const found = new Set();
  for (const text of texts) {
    const value = String(text || '');
    for (const match of value.match(/\{\{\w+\}\}/g) || []) {
      found.add(match);
    }
    for (const match of value.match(/\[[^\[\]]+\]/g) || []) {
      const inner = match.slice(1, -1).trim();
      // Ignore empty / numeric markers; flag leftover bracket fill-ins if typed manually.
      if (inner && /[a-zA-Z]/.test(inner)) {
        found.add(match);
      }
    }
  }
  return [...found];
}

const VALID_FORMATS = new Set(['video call', 'in person']);

const STOCK_FORMATS = [
  'select format',
  'video call or in person',
  'video call / in person — edit as needed',
  'video call / in person - edit as needed',
];

const STOCK_LOCATIONS = [
  'select location',
  'add details',
  'add meeting link',
  'add address',
  'same as invitation',
  'meeting link will be shared before the interview',
];

const STOCK_DATETIMES = ['select date & time', 'select date'];

export function extractLabeledValue(text, label) {
  const re = new RegExp(`^${label}:\\s*(.*)$`, 'im');
  const match = String(text || '').match(re);
  return match ? match[1].trim() : '';
}

export function setLabeledValue(text, label, value) {
  const source = String(text || '');
  const re = new RegExp(`^${label}:\\s*.*$`, 'im');
  const nextLine = `${label}: ${value}`;
  if (re.test(source)) return source.replace(re, nextLine);
  return source;
}

function isBlankOrStock(value, stockList) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, '-');
  if (!normalized) return true;
  if (stockList.some((stock) => normalized === stock || normalized.includes(stock))) {
    return true;
  }
  return (
    normalized.includes('edit as needed') ||
    normalized.includes('add details') ||
    normalized.includes('same as invitation') ||
    normalized.includes('select format') ||
    normalized.includes('select location') ||
    normalized.includes('select date') ||
    normalized.includes('add meeting link') ||
    normalized.includes('add address')
  );
}

function isValidInterviewFormat(value) {
  return VALID_FORMATS.has(String(value || '').trim().toLowerCase());
}

/**
 * Hard stops for interview emails. Invitation AND reminder must have
 * a real future slot, format, and location — not the template defaults.
 */
export function getInterviewSendBlockers({
  emailBody,
  reminderBody,
  interviewAtIso,
  interviewTouched = false,
  initialInterviewIso = '',
  isResend = false,
} = {}) {
  const issues = [];
  const format = extractLabeledValue(emailBody, 'Format');
  const location = extractLabeledValue(emailBody, 'Location or link');
  const reminderFormat = extractLabeledValue(reminderBody, 'Format');
  const reminderLocation = extractLabeledValue(reminderBody, 'Location or link');
  const dateLine = extractLabeledValue(emailBody, 'Date & time');

  if (!interviewAtIso) {
    issues.push({
      field: 'Date & time',
      message: 'Pick the real interview date and time. You cannot send with a blank slot.',
    });
  } else {
    const when = new Date(interviewAtIso).getTime();
    if (Number.isNaN(when) || when <= Date.now()) {
      issues.push({
        field: 'Date & time',
        message: 'STOP — that time is not in the future. Set a later date and time.',
      });
    } else if (
      !isResend &&
      !interviewTouched &&
      initialInterviewIso &&
      interviewAtIso === initialInterviewIso
    ) {
      issues.push({
        field: 'Date & time',
        message: 'Choose the interview date and time from the lists. Past days cannot be selected.',
      });
    }
  }

  if ((!dateLine || isBlankOrStock(dateLine, STOCK_DATETIMES)) && interviewAtIso) {
    issues.push({
      field: 'Date & time',
      message: 'Choose a date and time from the lists. Past days are not available.',
    });
  }

  if (!isValidInterviewFormat(format) || isBlankOrStock(format, STOCK_FORMATS)) {
    issues.push({
      field: 'Format',
      message: 'Choose Video call or In person from the list. You cannot send until one is selected.',
    });
  }

  if (isBlankOrStock(location, STOCK_LOCATIONS)) {
    issues.push({
      field: 'Location or link',
      message:
        String(format).toLowerCase() === 'in person'
          ? 'Enter the street address. Placeholder text will not send.'
          : 'Enter the meeting link. Placeholder text will not send.',
    });
  }

  if (!isValidInterviewFormat(reminderFormat) || isBlankOrStock(reminderFormat, STOCK_FORMATS)) {
    issues.push({
      field: 'Reminder · Format',
      message: 'The reminder Format is still the placeholder. It must match the real invitation.',
    });
  }

  if (isBlankOrStock(reminderLocation, STOCK_LOCATIONS)) {
    issues.push({
      field: 'Reminder · Location or link',
      message:
        'The reminder still has placeholder location text. Put the real meeting link or address there too.',
    });
  }

  return issues;
}

export function buildEmailContext(application, job, companyName, interviewAt) {
  const firstName =
    application.firstName ||
    application.candidate_first_name ||
    (application.candidateName || '').split(/\s+/)[0] ||
    'there';
  const lastName =
    application.lastName ||
    application.candidate_last_name ||
    (application.candidateName || '').split(/\s+/).slice(1).join(' ') ||
    '';

  return {
    first_name: firstName,
    last_name: lastName,
    job_title: job?.title || application.jobTitle || 'this role',
    company_name: companyName || application.companyName || 'Blvck Sapphire',
    interview_at: interviewAt ? formatDateTime(interviewAt) : '',
  };
}

export function defaultStatusEmailFields(status, application, job, companyName, interviewAtIso) {
  const template = TEMPLATES[status];
  if (!template) {
    return {
      emailSubject: '',
      emailBody: '',
      reminderEmailSubject: '',
      reminderEmailBody: '',
    };
  }

  const context = buildEmailContext(application, job, companyName, interviewAtIso);

  return {
    emailSubject: applyEmailPlaceholders(template.subject, context),
    emailBody: applyEmailPlaceholders(template.body, context),
    reminderEmailSubject: template.reminderSubject
      ? applyEmailPlaceholders(template.reminderSubject, context)
      : '',
    reminderEmailBody: template.reminderBody
      ? applyEmailPlaceholders(template.reminderBody, context)
      : '',
  };
}

function defaultInterviewTime() {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  date.setHours(14, 0, 0, 0);
  return date.toISOString();
}

export function buildStatusEmailDefaults(application, job, companyName, targetStatus) {
  const interviewIso =
    application?.interviewAt && targetStatus === 'interview'
      ? application.interviewAt
      : defaultInterviewTime();

  return {
    interviewIso,
    fields: defaultStatusEmailFields(
      targetStatus,
      application,
      job,
      companyName,
      interviewIso
    ),
  };
}

export function buildStatusEmailPatch({
  status,
  emailSubject,
  emailBody,
  emailHtml,
  interviewAt,
  reminderEmailSubject,
  reminderEmailBody,
  reminderEmailHtml,
  sendEmail = true,
}) {
  const subject = String(emailSubject || '').trim();
  const bodyText = String(emailBody || '').trim();

  if (!status) {
    throw new Error('Status is required.');
  }

  if (sendEmail) {
    if (!subject || !bodyText) {
      throw new Error('Email subject and body are required before notifying the candidate.');
    }

    const unresolvedMain = findUnresolvedEmailPlaceholders(bodyText);
    if (unresolvedMain.length) {
      throw new Error(
        `Replace placeholder text before sending: ${unresolvedMain.join(', ')}`
      );
    }
  }

  const body = { status };

  if (sendEmail) {
    body.send_email = true;
    body.email_subject = subject;
    body.email_body = bodyText;
    if (emailHtml?.trim()) {
      body.email_html = String(emailHtml).trim();
    }
  }

  if (status === 'interview') {
    if (interviewAt) {
      body.interview_at = interviewAt;
    }
    if (sendEmail) {
      const reminderSubject = String(reminderEmailSubject || '').trim();
      const reminderBody = String(reminderEmailBody || '').trim();
      if (!interviewAt) {
        throw new Error('Interview date and time are required.');
      }
      if (!reminderSubject || !reminderBody) {
        throw new Error('Reminder email subject and body are required for interviews.');
      }
      const unresolvedReminder = findUnresolvedEmailPlaceholders(reminderBody);
      if (unresolvedReminder.length) {
        throw new Error(
          `Replace placeholder text in the reminder before sending: ${unresolvedReminder.join(', ')}`
        );
      }
      const blockers = getInterviewSendBlockers({
        emailBody: bodyText,
        reminderBody,
        interviewAtIso: interviewAt,
        interviewTouched: true,
        isResend: true,
      });
      if (blockers.length) {
        throw new Error(
          `YOU CANNOT SEND YET.\n${blockers.map((item) => `• ${item.field}: ${item.message}`).join('\n')}`
        );
      }
      body.reminder_email_subject = reminderSubject;
      body.reminder_email_body = reminderBody;
      if (reminderEmailHtml?.trim()) {
        body.reminder_email_html = String(reminderEmailHtml).trim();
      }
    }
  }

  return body;
}

/** Silent stage change — no candidate email. */
export function buildSilentStatusPatch({ status, interviewAt } = {}) {
  if (!status) {
    throw new Error('Status is required.');
  }
  const body = { status };
  if (status === 'interview' && interviewAt) {
    body.interview_at = interviewAt;
  }
  return body;
}

export function toDatetimeLocalValue(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function datetimeLocalToIso(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}
