const REVIEWS_KEY = 'ats-candidate-reviews';
const TEMPLATES_KEY = 'ats-email-templates';
const JOB_FILTER_KEY = 'ats-selected-job';
const THEME_KEY = 'ats-portal-theme';
const FILTER_RAIL_KEY = 'ats-filter-rail-collapsed';
const NAV_HIDDEN_KEY = 'ats-portal-nav-hidden';
const REVIEW_QUEUE_KEY = 'ats-review-queue';

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readReviews() {
  return readJson(REVIEWS_KEY, {});
}

export function readReview(applicationId) {
  const all = readReviews();
  return (
    all[applicationId] || {
      rating: 0,
      tags: [],
      notes: [],
      events: [],
    }
  );
}

export function writeReview(applicationId, patch) {
  const all = readReviews();
  const current = readReview(applicationId);
  all[applicationId] = { ...current, ...patch };
  writeJson(REVIEWS_KEY, all);
  return all[applicationId];
}

export function addReviewNote(applicationId, { author, body }) {
  const current = readReview(applicationId);
  const note = {
    id: `note_${Date.now()}`,
    author: author || 'Reviewer',
    body: String(body || '').trim(),
    at: new Date().toISOString(),
  };
  if (!note.body) return current;
  return writeReview(applicationId, {
    notes: [note, ...(current.notes || [])],
    events: [
      {
        id: `evt_${Date.now()}`,
        at: note.at,
        text: `${note.author} added a note`,
      },
      ...(current.events || []),
    ],
  });
}

export function readTemplateOverrides() {
  return readJson(TEMPLATES_KEY, {});
}

export function writeTemplateOverride(status, template) {
  const all = readTemplateOverrides();
  all[status] = template;
  writeJson(TEMPLATES_KEY, all);
  return all;
}

export function readSelectedJob() {
  if (typeof window === 'undefined') return '';
  return window.sessionStorage.getItem(JOB_FILTER_KEY) || '';
}

export function writeSelectedJob(jobId) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(JOB_FILTER_KEY, jobId || '__all');
}

export function readPortalTheme() {
  const value = readJson(THEME_KEY, 'light');
  return value === 'dark' ? 'dark' : 'light';
}

export function writePortalTheme(theme) {
  writeJson(THEME_KEY, theme === 'dark' ? 'dark' : 'light');
}

export function readFilterRailCollapsed() {
  return readJson(FILTER_RAIL_KEY, false) === true;
}

export function writeFilterRailCollapsed(collapsed) {
  writeJson(FILTER_RAIL_KEY, Boolean(collapsed));
}

export function readNavHidden() {
  return readJson(NAV_HIDDEN_KEY, false) === true;
}

export function writeNavHidden(hidden) {
  writeJson(NAV_HIDDEN_KEY, Boolean(hidden));
}

export function writeReviewQueue(ids) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(REVIEW_QUEUE_KEY, JSON.stringify(ids || []));
}

export function readReviewQueue() {
  if (typeof window === 'undefined') return [];
  try {
    const ids = JSON.parse(window.sessionStorage.getItem(REVIEW_QUEUE_KEY) || '[]');
    return Array.isArray(ids) ? ids.filter(Boolean) : [];
  } catch {
    return [];
  }
}
