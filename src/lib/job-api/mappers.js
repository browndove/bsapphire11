import { DEFAULT_JOB_CURRENCY, EMPLOYER_APPLICATION_STATUSES, EMPLOYER_STATUS_UPDATES, JOB_CURRENCY_SYMBOL } from './config';
import { normalizeApplicationFields } from './application-fields';

export function getPaginatedItems(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? res.items ?? [];
}

export function getPaginatedTotal(res, items) {
  return res?.total ?? items.length;
}

export const PortalStages = {
  labels: {
    submitted: 'Submitted',
    reviewing: 'Reviewing',
    shortlisted: 'Shortlisted',
    interview: 'Interview',
    rejected: 'Rejected',
    hired: 'Hired',
    withdrawn: 'Withdrawn',
  },
  tagClassByStatus: {
    submitted: 'tag-stage-new',
    reviewing: 'tag-stage-screening',
    shortlisted: 'tag-stage-screening',
    interview: 'tag-stage-interview',
    rejected: 'tag-stage-declined',
    hired: 'tag-stage-hired',
    withdrawn: 'tag-stage-declined',
  },
};

export function mapScreeningQuestionFromApi(q) {
  if (!q) return null;
  const type = ['single', 'multi', 'text', 'number'].includes(q.type) ? q.type : 'single';
  return {
    id: q.id || q.question_id || `sq_${Math.random().toString(36).slice(2, 10)}`,
    label: q.label || q.text || '',
    type,
    filterable: type === 'text' ? false : !!(q.filterable ?? q.is_filterable),
    options: Array.isArray(q.options) ? q.options : [],
  };
}

export function normalizeJobTextFormat(value) {
  return value === 'plain' ? 'plain' : 'markdown';
}

export function mapJobFromApi(job, categoriesById = {}) {
  if (!job) return null;
  const category = job.category_id ? categoriesById[job.category_id] : null;
  const rawQuestions = job.screening_questions || job.screeningQuestions || [];
  return {
    id: job.id,
    title: job.title || '',
    department: category?.name || job.department || '',
    location: job.location || '',
    status: job.status || 'draft',
    publishedAt: job.published_at || job.updated_at || null,
    description: job.description || '',
    requirements: job.requirements || '',
    descriptionFormat: normalizeJobTextFormat(
      job.description_format || job.descriptionFormat
    ),
    requirementsFormat: normalizeJobTextFormat(
      job.requirements_format || job.requirementsFormat
    ),
    remoteType: job.remote_type || 'remote',
    employmentType: job.employment_type || 'full_time',
    salaryMin: job.salary_min ?? null,
    salaryMax: job.salary_max ?? null,
    // Portal only supports Ghana Cedis; normalize legacy USD/other values.
    currency: DEFAULT_JOB_CURRENCY,
    categoryId: job.category_id || null,
    screeningQuestions: rawQuestions.map(mapScreeningQuestionFromApi).filter(Boolean),
    applicationFields: normalizeApplicationFields(
      job.application_fields || job.applicationFields
    ),
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  };
}

export function mapJobToApi(job, { isCreate = false } = {}) {
  let status = job.status || 'draft';
  if (isCreate && status !== 'draft' && status !== 'published') {
    status = 'draft';
  }

  const body = {
    title: job.title,
    description: job.description,
    description_format: normalizeJobTextFormat(job.descriptionFormat),
    requirements: job.requirements || '',
    requirements_format: normalizeJobTextFormat(job.requirementsFormat),
    location: job.location || '',
    remote_type: job.remoteType || 'remote',
    employment_type: job.employmentType || 'full_time',
    status,
  };
  if (job.categoryId) body.category_id = job.categoryId;
  if (job.salaryMin != null && job.salaryMin !== '') body.salary_min = Number(job.salaryMin);
  if (job.salaryMax != null && job.salaryMax !== '') body.salary_max = Number(job.salaryMax);
  body.currency = DEFAULT_JOB_CURRENCY;
  if (Array.isArray(job.screeningQuestions) && job.screeningQuestions.length > 0) {
    body.screening_questions = job.screeningQuestions
      .filter((q) => q.label?.trim())
      .map((q) => {
        const type = ['single', 'multi', 'text', 'number'].includes(q.type) ? q.type : 'single';
        const isChoice = type === 'single' || type === 'multi';
        const cleanOptions = isChoice
          ? (q.options || []).map((o) => o.trim()).filter(Boolean)
          : [];
        return {
          id: q.id,
          label: q.label.trim(),
          type,
          filterable: !!(q.filterable && type !== 'text' && (type === 'number' || cleanOptions.length)),
          options: cleanOptions,
        };
      });
  }
  body.application_fields = normalizeApplicationFields(job.applicationFields);
  return body;
}

export function mapApplicationFromApi(app) {
  if (!app) return null;
  const candidate = app.candidate || app.user || {};
  const firstName =
    candidate.first_name ||
    candidate.candidate_first_name ||
    app.candidate_first_name ||
    app.first_name ||
    '';
  const lastName =
    candidate.last_name ||
    candidate.candidate_last_name ||
    app.candidate_last_name ||
    app.last_name ||
    '';
  const email = candidate.email || app.candidate_email || app.email || '';
  const emailName = email ? String(email).split('@')[0] : '';
  const name =
    [firstName, lastName].filter(Boolean).join(' ') ||
    app.candidate_name ||
    emailName ||
    'Applicant';

  return {
    id: app.id,
    jobId: app.job_id || app.jobId,
    jobTitle: app.job?.title || app.job_title || '',
    submittedAt: app.created_at || app.submitted_at || app.submittedAt,
    candidateName: name,
    firstName,
    lastName,
    email: candidate.email || app.candidate_email || app.email || '',
    phone: candidate.phone || app.candidate_phone || app.phone || '',
    status: app.status || 'submitted',
    companyName: app.company_name || app.company?.name || '',
    interviewAt: app.interview_at || null,
    interviewReminderSentAt: app.interview_reminder_sent_at || null,
    emailSent: app.email_sent,
    emailError: app.email_error || '',
    coverLetter: app.cover_letter || '',
    resumeUrl: app.resume_url || '',
    githubUrl: app.github_url || '',
    additionalLink: app.additional_link || '',
    additionalDocumentUrl: app.additional_document_url || '',
    answers: app.answers ?? {},
    source: app.source || 'Website',
  };
}

function appendOptionalApplicationFields(body, {
  githubUrl,
  additionalLink,
  additionalDocumentUrl,
}) {
  if (githubUrl?.trim()) {
    body.github_url = githubUrl.trim();
  }
  if (additionalLink?.trim()) {
    body.additional_link = additionalLink.trim();
  }
  if (additionalDocumentUrl?.trim()) {
    body.additional_document_url = additionalDocumentUrl.trim();
  }
  return body;
}

function appendScreeningAnswers(body, answers = {}) {
  const cleanAnswers = {};
  for (const [id, value] of Object.entries(answers)) {
    if (Array.isArray(value)) {
      if (value.length) cleanAnswers[id] = value;
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      cleanAnswers[id] = value;
    } else if (value != null && String(value).trim()) {
      const trimmed = String(value).trim();
      const asNumber = Number(trimmed);
      cleanAnswers[id] =
        trimmed !== '' && Number.isFinite(asNumber) && /^-?\d+(\.\d+)?$/.test(trimmed)
          ? asNumber
          : trimmed;
    }
  }
  if (Object.keys(cleanAnswers).length) {
    body.answers = cleanAnswers;
  }
  return body;
}

/** Normalize apply-form answers (especially number fields) before API submit. */
export function normalizeScreeningAnswersForApi(questions = [], answers = {}) {
  const out = {};
  for (const q of questions || []) {
    const value = answers[q.id];
    if (q.type === 'multi') {
      if (Array.isArray(value) && value.length) out[q.id] = value;
      continue;
    }
    if (q.type === 'number') {
      if (value === '' || value == null) continue;
      const n = Number(value);
      if (Number.isFinite(n)) out[q.id] = n;
      continue;
    }
    if (value != null && String(value).trim()) {
      out[q.id] = String(value).trim();
    }
  }
  return out;
}

export function mapApplicationSubmitToApi({
  jobId,
  coverLetter,
  resumeUrl,
  githubUrl,
  additionalLink,
  additionalDocumentUrl,
  answers = {},
}) {
  const body = {
    job_id: jobId,
  };
  if (coverLetter?.trim()) {
    body.cover_letter = coverLetter;
  }
  if (resumeUrl?.trim()) {
    body.resume_url = resumeUrl;
  }
  appendOptionalApplicationFields(body, { githubUrl, additionalLink, additionalDocumentUrl });
  return appendScreeningAnswers(body, answers);
}

export function mapGuestApplicationSubmitToApi({
  firstName,
  lastName,
  email,
  phone,
  coverLetter,
  resumeUrl,
  githubUrl,
  additionalLink,
  additionalDocumentUrl,
  answers = {},
}) {
  const body = {
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    email: email.trim(),
  };
  if (phone?.trim()) {
    body.phone = phone.trim();
  }
  if (coverLetter?.trim()) {
    body.cover_letter = coverLetter;
  }
  if (resumeUrl?.trim()) {
    body.resume_url = resumeUrl;
  }
  appendOptionalApplicationFields(body, { githubUrl, additionalLink, additionalDocumentUrl });
  return appendScreeningAnswers(body, answers);
}

export function deriveScreeningFiltersFromApplications(applications, jobQuestions = []) {
  const byId = Object.fromEntries((jobQuestions || []).map((q) => [q.id, q]));
  const buckets = new Map();

  for (const app of applications || []) {
    for (const [qid, value] of Object.entries(app.answers || {})) {
      const meta = byId[qid];
      if (meta?.type === 'text' || meta?.type === 'number') continue;

      if (!buckets.has(qid)) {
        buckets.set(qid, {
          id: qid,
          label: meta?.label || qid.replace(/^sq_/, '').replace(/_/g, ' '),
          type: meta?.type || (Array.isArray(value) ? 'multi' : 'single'),
          filterable: true,
          options: new Set(),
        });
      }

      const bucket = buckets.get(qid);
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v != null && String(v).trim()) bucket.options.add(String(v).trim());
        });
      } else if (value != null && String(value).trim()) {
        bucket.options.add(String(value).trim());
      }
    }
  }

  return [...buckets.values()]
    .filter((q) => q.options.size > 0)
    .map((q) => ({ ...q, options: [...q.options].sort() }));
}

export function getFilterableScreeningQuestions(jobQuestions = [], applications = []) {
  const questions = jobQuestions || [];
  const filterable = questions.filter((q) => {
    if (!q.filterable || q.type === 'text') return false;
    if (q.type === 'number') return true;
    return (q.options || []).filter(Boolean).length > 0;
  });
  if (filterable.length) return filterable;

  const fallback = questions.filter((q) => {
    if (q.type === 'text') return false;
    if (q.type === 'number') return true;
    return (q.options || []).filter(Boolean).length > 0;
  });
  if (fallback.length) return fallback;

  return deriveScreeningFiltersFromApplications(applications, questions);
}

export function formatAnswerValue(value) {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return value != null ? String(value) : '';
}

export function matchesScreeningFilters(app, filters = {}, numericFilters = {}) {
  const answers = app.answers || {};
  const normalize = (value) => String(value ?? '').trim().toLowerCase();

  const choiceOk = Object.entries(filters)
    .filter(([, opts]) => opts?.length)
    .every(([qid, selected]) => {
      const answer = answers[qid];
      if (answer == null || answer === '') return false;
      const wanted = selected.map(normalize).filter(Boolean);
      if (!wanted.length) return true;
      if (Array.isArray(answer)) {
        const have = answer.map(normalize).filter(Boolean);
        return wanted.some((opt) => have.includes(opt));
      }
      return wanted.includes(normalize(answer));
    });
  if (!choiceOk) return false;

  return Object.entries(numericFilters || {}).every(([qid, range]) => {
    if (!range || (range.min === '' && range.max === '' && (range.exact === '' || range.exact == null))) {
      return true;
    }
    const n = Number(answers[qid]);
    if (!Number.isFinite(n)) return false;
    if (range.exact !== '' && range.exact != null && Number.isFinite(Number(range.exact))) {
      return n === Number(range.exact);
    }
    if (range.min !== '' && range.min != null && Number.isFinite(Number(range.min)) && n < Number(range.min)) {
      return false;
    }
    if (range.max !== '' && range.max != null && Number.isFinite(Number(range.max)) && n > Number(range.max)) {
      return false;
    }
    return true;
  });
}

export function buildScreeningFilterParams(jobId, screeningFilters = {}, numericFilters = {}) {
  const params = { job_id: jobId };
  for (const [qid, opts] of Object.entries(screeningFilters)) {
    if (!opts?.length) continue;
    params[`answer_${qid}`] = opts;
  }
  for (const [qid, range] of Object.entries(numericFilters || {})) {
    if (!range) continue;
    if (range.exact !== '' && range.exact != null) params[`answer_${qid}`] = range.exact;
    if (range.min !== '' && range.min != null) params[`answer_min_${qid}`] = range.min;
    if (range.max !== '' && range.max != null) params[`answer_max_${qid}`] = range.max;
  }
  return params;
}

export function mapPublicJobFromApi(job, categoriesById = {}) {
  const mapped = mapJobFromApi(job, categoriesById);
  if (!mapped) return null;
  return {
    ...mapped,
    employmentLabel: formatEmploymentType(mapped.employmentType),
    remoteLabel: formatRemoteType(mapped.remoteType),
  };
}

export function formatEmploymentType(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatRemoteType(value) {
  const labels = { onsite: 'On-site', hybrid: 'Hybrid', remote: 'Remote' };
  return labels[value] || value || 'Remote';
}

export function formatSalaryRange(job) {
  if (!job) return '';
  const min = job.salaryMin != null && job.salaryMin !== '' ? Number(job.salaryMin) : null;
  const max = job.salaryMax != null && job.salaryMax !== '' ? Number(job.salaryMax) : null;
  const hasMin = min != null && !Number.isNaN(min);
  const hasMax = max != null && !Number.isNaN(max);
  if (!hasMin && !hasMax) return '';

  const symbol = JOB_CURRENCY_SYMBOL;
  const formatAmount = (n) =>
    new Intl.NumberFormat('en-GH', { maximumFractionDigits: 0 }).format(n);

  if (hasMin && hasMax) {
    if (min === max) return `${symbol}${formatAmount(min)}`;
    return `${symbol}${formatAmount(min)} – ${symbol}${formatAmount(max)}`;
  }
  if (hasMin) return `From ${symbol}${formatAmount(min)}`;
  return `Up to ${symbol}${formatAmount(max)}`;
}

export function getPipelineStatuses() {
  return EMPLOYER_APPLICATION_STATUSES.filter((s) => s !== 'withdrawn');
}

export function getEmployerStatusUpdates() {
  return EMPLOYER_STATUS_UPDATES;
}
