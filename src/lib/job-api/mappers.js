import { DEFAULT_JOB_CURRENCY, EMPLOYER_APPLICATION_STATUSES, EMPLOYER_STATUS_UPDATES } from './config';

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
  return {
    id: q.id || q.question_id || `sq_${Math.random().toString(36).slice(2, 10)}`,
    label: q.label || q.text || '',
    type: q.type || 'single',
    filterable: !!(q.filterable ?? q.is_filterable),
    options: Array.isArray(q.options) ? q.options : [],
  };
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
    remoteType: job.remote_type || 'remote',
    employmentType: job.employment_type || 'full_time',
    salaryMin: job.salary_min ?? null,
    salaryMax: job.salary_max ?? null,
    currency: job.currency || DEFAULT_JOB_CURRENCY,
    categoryId: job.category_id || null,
    screeningQuestions: rawQuestions.map(mapScreeningQuestionFromApi).filter(Boolean),
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
    requirements: job.requirements || '',
    location: job.location || '',
    remote_type: job.remoteType || 'remote',
    employment_type: job.employmentType || 'full_time',
    status,
  };
  if (job.categoryId) body.category_id = job.categoryId;
  if (job.salaryMin != null && job.salaryMin !== '') body.salary_min = Number(job.salaryMin);
  if (job.salaryMax != null && job.salaryMax !== '') body.salary_max = Number(job.salaryMax);
  if (job.currency) body.currency = job.currency;
  if (Array.isArray(job.screeningQuestions) && job.screeningQuestions.length > 0) {
    body.screening_questions = job.screeningQuestions
      .filter((q) => q.label?.trim())
      .map((q) => {
        const cleanOptions =
          q.type === 'text'
            ? []
            : (q.options || []).map((o) => o.trim()).filter(Boolean);
        return {
          id: q.id,
          label: q.label.trim(),
          type: q.type || 'single',
          filterable: !!(q.filterable && q.type !== 'text' && cleanOptions.length),
          options: cleanOptions,
        };
      });
  }
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
    email: candidate.email || app.candidate_email || app.email || '',
    phone: candidate.phone || app.candidate_phone || app.phone || '',
    status: app.status || 'submitted',
    coverLetter: app.cover_letter || '',
    resumeUrl: app.resume_url || '',
    answers: app.answers ?? {},
    source: app.source || 'Website',
  };
}

export function mapApplicationSubmitToApi({ jobId, coverLetter, resumeUrl, answers = {} }) {
  const body = {
    job_id: jobId,
    cover_letter: coverLetter,
    resume_url: resumeUrl,
  };
  const cleanAnswers = {};
  for (const [id, value] of Object.entries(answers)) {
    if (Array.isArray(value)) {
      if (value.length) cleanAnswers[id] = value;
    } else if (value != null && String(value).trim()) {
      cleanAnswers[id] = String(value).trim();
    }
  }
  if (Object.keys(cleanAnswers).length) {
    body.answers = cleanAnswers;
  }
  return body;
}

export function mapGuestApplicationSubmitToApi({
  firstName,
  lastName,
  email,
  phone,
  coverLetter,
  resumeUrl,
  answers = {},
}) {
  const body = {
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    email: email.trim(),
    cover_letter: coverLetter,
    resume_url: resumeUrl,
  };
  if (phone?.trim()) {
    body.phone = phone.trim();
  }
  const cleanAnswers = {};
  for (const [id, value] of Object.entries(answers)) {
    if (Array.isArray(value)) {
      if (value.length) cleanAnswers[id] = value;
    } else if (value != null && String(value).trim()) {
      cleanAnswers[id] = String(value).trim();
    }
  }
  if (Object.keys(cleanAnswers).length) {
    body.answers = cleanAnswers;
  }
  return body;
}

export function deriveScreeningFiltersFromApplications(applications, jobQuestions = []) {
  const byId = Object.fromEntries((jobQuestions || []).map((q) => [q.id, q]));
  const buckets = new Map();

  for (const app of applications || []) {
    for (const [qid, value] of Object.entries(app.answers || {})) {
      const meta = byId[qid];
      if (meta?.type === 'text') continue;

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
  const filterable = questions.filter(
    (q) => q.filterable && q.type !== 'text' && (q.options || []).length
  );
  if (filterable.length) return filterable;

  const choiceQuestions = questions.filter(
    (q) => q.type !== 'text' && (q.options || []).length
  );
  if (choiceQuestions.length) return choiceQuestions;

  return deriveScreeningFiltersFromApplications(applications, questions);
}

export function formatAnswerValue(value) {
  if (Array.isArray(value)) return value.join(', ');
  return value != null ? String(value) : '';
}

export function matchesScreeningFilters(app, filters = {}) {
  const active = Object.entries(filters).filter(([, opts]) => opts?.length);
  if (!active.length) return true;
  const answers = app.answers || {};
  return active.every(([qid, selected]) => {
    const answer = answers[qid];
    if (answer == null) return false;
    if (Array.isArray(answer)) {
      return selected.some((opt) => answer.includes(opt));
    }
    return selected.includes(answer);
  });
}

export function buildScreeningFilterParams(jobId, screeningFilters = {}) {
  const params = { job_id: jobId };
  for (const [qid, opts] of Object.entries(screeningFilters)) {
    if (!opts?.length) continue;
    params[`answer_${qid}`] = opts;
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

export function getPipelineStatuses() {
  return EMPLOYER_APPLICATION_STATUSES.filter((s) => s !== 'withdrawn');
}

export function getEmployerStatusUpdates() {
  return EMPLOYER_STATUS_UPDATES;
}
