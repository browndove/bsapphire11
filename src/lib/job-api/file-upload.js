export const FILE_MAX_BYTES = 20 * 1024 * 1024;

export const UPLOAD_PURPOSES = ['resume', 'company_logo', 'document'];

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]);

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function allowedMimeTypesForPurpose(purpose) {
  if (purpose === 'company_logo') return IMAGE_MIME_TYPES;
  return new Set([...IMAGE_MIME_TYPES, ...DOCUMENT_MIME_TYPES]);
}

export function acceptStringForPurpose(purpose) {
  if (purpose === 'company_logo') {
    return IMAGE_EXTENSIONS.join(',');
  }
  return [...DOCUMENT_EXTENSIONS, ...IMAGE_EXTENSIONS].join(',');
}

export function hintForPurpose(purpose) {
  if (purpose === 'company_logo') {
    return `Images up to ${formatFileSize(FILE_MAX_BYTES)}`;
  }
  if (purpose === 'document') {
    return `PDF, Word, Excel, text, or images up to ${formatFileSize(FILE_MAX_BYTES)}`;
  }
  return `PDF or Word up to ${formatFileSize(FILE_MAX_BYTES)}`;
}

function matchesExtension(name, extensions) {
  const lower = (name || '').toLowerCase();
  return extensions.some((ext) => lower.endsWith(ext));
}

export function isAllowedUploadFile(file, purpose = 'resume') {
  if (!file) return false;
  if (file.size > FILE_MAX_BYTES) return false;

  const allowedMimes = allowedMimeTypesForPurpose(purpose);
  if (file.type && allowedMimes.has(file.type)) return true;

  if (purpose === 'company_logo') {
    return matchesExtension(file.name, IMAGE_EXTENSIONS);
  }

  return (
    matchesExtension(file.name, DOCUMENT_EXTENSIONS) ||
    matchesExtension(file.name, IMAGE_EXTENSIONS)
  );
}

export function validationErrorForPurpose(purpose = 'resume') {
  if (purpose === 'company_logo') {
    return `Upload an image up to ${formatFileSize(FILE_MAX_BYTES)}.`;
  }
  if (purpose === 'document') {
    return `Upload a supported file up to ${formatFileSize(FILE_MAX_BYTES)}.`;
  }
  return `Upload a PDF or Word file up to ${formatFileSize(FILE_MAX_BYTES)}.`;
}
