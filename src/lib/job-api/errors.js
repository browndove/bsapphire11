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
  status: 'Status',
  title: 'Job title',
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
  ];
  return technicalPatterns.some((pattern) => pattern.test(message.trim()));
}

function humanizeReason(reason) {
  if (reason == null) return 'is not valid';
  const text = String(reason).trim();
  const lower = text.toLowerCase();
  return REASON_MESSAGES[lower] || text.replace(/_/g, ' ');
}

function formatValidationDetails(details) {
  if (!details || typeof details !== 'object') return '';
  const parts = Object.entries(details).map(([field, reason]) => {
    const label = FIELD_LABELS[field] || field.replace(/_/g, ' ');
    return `${label} ${humanizeReason(reason)}.`;
  });
  return parts.join(' ');
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
  err.details = data?.details;
  err.payload = data;
  err.message = toUserMessage(err, context);
  return err;
}
