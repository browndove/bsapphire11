const STATUS_MESSAGES = {
  400: 'Please check your input and try again.',
  401: 'Your sign-in details are incorrect, your session expired, or verification failed.',
  403: 'You do not have permission to access this area.',
  404: 'We could not find that record.',
  409: 'That conflicts with something already on file.',
  422: 'Please check your input and try again.',
  429: 'Too many attempts. Please wait a moment and try again.',
  500: 'Something went wrong on our side. Please try again shortly.',
  502: 'We could not reach the job portal service. Please try again shortly.',
  503: 'The job portal service is temporarily unavailable. Please try again shortly.',
};

const FIELD_LABELS = {
  email: 'Email',
  password: 'Password',
  code: 'Verification code',
  pending_token: 'Sign-in session',
  first_name: 'First name',
  last_name: 'Last name',
  phone: 'Phone',
  headline: 'Headline',
  job_id: 'Job',
  cover_letter: 'Cover letter',
  resume_url: 'Resume',
  github_url: 'GitHub URL',
  additional_link: 'Additional link',
  additional_document_url: 'Additional document',
  logo_url: 'Logo',
  status: 'Status',
  title: 'Job title',
  email_subject: 'Email subject',
  email_body: 'Email body',
  interview_at: 'Interview date & time',
  reminder_email_subject: 'Reminder email subject',
  reminder_email_body: 'Reminder email body',
};

const REASON_MESSAGES = {
  required: 'is required',
  invalid: 'is not valid',
  'invalid credentials': 'is not correct',
  'already exists': 'is already in use',
  'already registered': 'is already registered',
  'wrong password': 'is not correct',
  'invalid code': 'is not valid',
  expired: 'has expired',
};

function isTechnicalMessage(message) {
  if (!message || typeof message !== 'string') return true;
  const technicalPatterns = [
    /^request failed \(\d+\)$/i,
    /^fetch failed/i,
    /^network error/i,
    /^failed to fetch/i,
    /^ECONNREFUSED/i,
    /^TypeError:/i,
    /^SyntaxError:/i,
    /Unexpected token/i,
    /^error:\s*\d+/i,
    /^HTTP \d+/i,
    /^\d{3}\s+page not found$/i,
  ];
  return technicalPatterns.some((pattern) => pattern.test(message.trim()));
}

function normalizeFieldKey(field) {
  const aliases = {
    EmailSubject: 'email_subject',
    EmailBody: 'email_body',
    EmailHtml: 'email_html',
    InterviewAt: 'interview_at',
    ReminderEmailSubject: 'reminder_email_subject',
    ReminderEmailBody: 'reminder_email_body',
    ReminderEmailHtml: 'reminder_email_html',
  };
  return aliases[field] || field;
}

function labelForField(field) {
  const normalized = normalizeFieldKey(field);
  if (FIELD_LABELS[normalized]) return FIELD_LABELS[normalized];
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  if (normalized.startsWith('answers.')) {
    return normalized.slice('answers.'.length).replace(/_/g, ' ');
  }
  return normalized
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, (c) => c.toUpperCase());
}

function humanizeReason(reason) {
  if (reason == null) return 'is not valid';
  const text = String(reason).trim();
  const lower = text.toLowerCase();
  if (lower === 'field is required' || lower === 'required') return 'is required';
  return REASON_MESSAGES[lower] || text.replace(/_/g, ' ');
}

function formatValidationDetails(details) {
  if (!details || typeof details !== 'object') return '';
  const parts = Object.entries(details).map(([field, reason]) => {
    const label = labelForField(field);
    return `${label} ${humanizeReason(reason)}.`;
  });
  return parts.join(' ');
}

export function getFieldErrors(err) {
  const raw = err?.details || err?.payload?.errors || err?.payload?.details || {};
  if (!raw || typeof raw !== 'object') return {};
  return { ...raw };
}

function messageForStatus(status, context) {
  if (context === 'login' && status === 401) {
    return 'Email or password is incorrect.';
  }
  if (context === '2fa' && status === 401) {
    return 'That verification code is not valid or has expired. Try again or restart sign-in.';
  }
  if (context === 'employer-only' && status === 403) {
    return 'This portal is for employer accounts only.';
  }
  if (context === 'register' && status === 409) {
    return 'That email is already registered. Try signing in instead.';
  }
  if (context === 'register' && status === 400) {
    return 'Please check your registration details. Passwords must be at least 8 characters and include upper, lower, number, and symbol.';
  }
  if (context === 'job' && status === 401) {
    return 'Your session expired or is invalid. Sign in again, then retry saving the job.';
  }
  if (context === 'job' && status === 404) {
    return 'That job posting could not be found. It may have already been deleted.';
  }
  if (context === 'job' && status === 409) {
    return 'This job cannot be deleted right now because it still has related records.';
  }
  if (context === 'apply' && status === 409) {
    return 'You already have an active application for this role.';
  }
  if (context === 'guest-apply' && status === 409) {
    return 'You have already applied for this role with this email address.';
  }
  if (context === 'guest-apply' && status === 404) {
    return 'Applications are temporarily unavailable. Please try again shortly.';
  }
  if (context === 'upload' && status === 503) {
    return 'File uploads are temporarily unavailable. Please try again later.';
  }
  if (context === 'upload' && status === 403) {
    return 'You do not have permission to upload this type of file.';
  }
  if (context === 'download' && status === 404) {
    return 'File download is not available on the server yet.';
  }
  if (context === 'download' && status === 503) {
    return 'File download is temporarily unavailable. Please try again later.';
  }
  if (context === 'download' && status === 403) {
    return 'You do not have permission to open this file.';
  }
  if (context === 'status-email' && status === 503) {
    return 'Email is not configured on the server. The application status was not updated.';
  }
  return STATUS_MESSAGES[status] || 'Something went wrong. Please try again.';
}

export function toUserMessage(err, context) {
  const status = Number(err?.status || err?.code || err?.payload?.code) || null;
  const apiMessage = err?.payload?.message || err?.message;
  const detailsText = formatValidationDetails(err?.details || err?.payload?.details);

  if (apiMessage && !isTechnicalMessage(apiMessage)) {
    if (detailsText && !apiMessage.includes(detailsText)) {
      return `${apiMessage} ${detailsText}`.trim();
    }
    return apiMessage;
  }

  if (detailsText) {
    return detailsText;
  }

  if (status) {
    return messageForStatus(status, context);
  }

  return 'Something went wrong. Please try again.';
}

export function createHttpError(res, data, context) {
  const status = res?.status || 500;
  const err = new Error(data?.message || 'Request failed');
  err.status = status;
  err.code = data?.code;
  err.details = data?.errors || data?.details;
  err.payload = data;
  err.message = toUserMessage(err, context);
  return err;
}
