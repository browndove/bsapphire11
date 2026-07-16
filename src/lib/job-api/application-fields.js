export const APPLICATION_FIELD_KEYS = [
  'cover_letter',
  'resume',
  'additional_document',
  'github_url',
  'additional_link',
];

export const APPLICATION_FIELD_REQUIREMENTS = ['required', 'optional', 'hidden'];

export const DEFAULT_APPLICATION_FIELDS = {
  cover_letter: 'required',
  resume: 'required',
  additional_document: 'optional',
  github_url: 'optional',
  additional_link: 'optional',
};

export const APPLICATION_FIELD_LABELS = {
  cover_letter: 'Cover letter',
  resume: 'Resume',
  additional_document: 'Additional document',
  github_url: 'GitHub URL',
  additional_link: 'Portfolio or other link',
};

export function normalizeApplicationFields(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const next = { ...DEFAULT_APPLICATION_FIELDS };

  for (const key of APPLICATION_FIELD_KEYS) {
    const value = String(source[key] || '').toLowerCase().trim();
    if (APPLICATION_FIELD_REQUIREMENTS.includes(value)) {
      next[key] = value;
    }
  }

  return next;
}

export function isApplicationFieldVisible(fields, key) {
  return normalizeApplicationFields(fields)[key] !== 'hidden';
}

export function isApplicationFieldRequired(fields, key) {
  return normalizeApplicationFields(fields)[key] === 'required';
}

export function applicationFieldLabel(key, fields) {
  const base = APPLICATION_FIELD_LABELS[key] || key;
  const requirement = normalizeApplicationFields(fields)[key];
  if (requirement === 'optional') return `${base} (optional)`;
  return base;
}
