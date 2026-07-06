export const RESUME_MAX_BYTES = 5 * 1024 * 1024;

export const RESUME_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const RESUME_ACCEPT = '.pdf,.doc,.docx';

export function isAllowedResume(file) {
  if (!file) return false;
  if (file.size > RESUME_MAX_BYTES) return false;
  const name = file.name?.toLowerCase() || '';
  const byExt = name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx');
  return RESUME_MIME_TYPES.has(file.type) || byExt;
}

export function formatResumeSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
