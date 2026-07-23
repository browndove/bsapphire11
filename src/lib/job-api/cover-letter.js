/**
 * Cover letters are file uploads when provided.
 * File URL is encoded in `cover_letter` so `additional_document_url` stays free for extras.
 * When there is no separate additional document, the file key is also stored in
 * `additional_document_url` so employers get the same link treatment as resumes.
 */

const FILE_MARKER_RE =
  /(?:^|\n)(?:---\n)?Cover letter file:\s*(.+)\n(\S+)\s*$/i;

const ATTACHED_STUB_RE = /^see attached cover letter(?:\s*:\s*(.+))?\.?$/i;

export function isBrowsableFileUrl(value = '') {
  return /^https?:\/\//i.test(String(value || '').trim());
}

export function fileNameFromStorageKey(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const path = isBrowsableFileUrl(raw) ? new URL(raw).pathname : raw;
    const segment = path.split('/').filter(Boolean).pop() || '';
    return decodeURIComponent(segment).replace(/^[0-9a-f-]{36}_/i, '') || segment;
  } catch {
    return raw.split('/').filter(Boolean).pop() || '';
  }
}

export async function composeCoverLetterMaterials({
  file = null,
  uploadFn,
  required = true,
}) {
  if (!file) {
    if (required) {
      const err = new Error('Please upload a cover letter.');
      err.status = 400;
      throw err;
    }
    return { coverLetter: '', fileUrl: '', fileName: '' };
  }

  if (typeof uploadFn !== 'function') {
    throw new Error('Cover letter upload is not available.');
  }

  const uploaded = await uploadFn(file);
  const url = uploaded?.file_url || uploaded?.url;
  if (!url) {
    throw new Error('Cover letter upload did not return a file URL.');
  }

  let body = '';
  if (file.type === 'text/plain' || String(file.name || '').toLowerCase().endsWith('.txt')) {
    try {
      body = String(await file.text()).trim();
    } catch {
      body = '';
    }
  }

  const fileName = file.name || 'cover-letter';
  const marker = `Cover letter file: ${fileName}\n${url}`;
  return {
    coverLetter: body ? `${body}\n\n---\n${marker}` : marker,
    fileUrl: url,
    fileName,
  };
}

/**
 * Decide how to persist cover letter + optional extra document.
 * Cover-only apps use `additional_document_url` (resume-style). Dual uploads keep
 * the cover letter marker in `cover_letter` and the extra file in the URL field.
 */
export function assignCoverLetterStorage({
  coverLetter = '',
  coverFileUrl = '',
  coverFileName = '',
  additionalDocumentUrl = '',
} = {}) {
  const extra = String(additionalDocumentUrl || '').trim();
  const coverUrl = String(coverFileUrl || '').trim();

  if (coverUrl && !extra) {
    const name = coverFileName || fileNameFromStorageKey(coverUrl) || 'document';
    return {
      coverLetter: `See attached cover letter: ${name}`,
      additionalDocumentUrl: coverUrl,
    };
  }

  return {
    coverLetter: coverLetter || '',
    additionalDocumentUrl: extra,
  };
}

export async function uploadOptionalDocument({ file = null, uploadFn }) {
  if (!file) return '';
  if (typeof uploadFn !== 'function') {
    throw new Error('Document upload is not available.');
  }
  const uploaded = await uploadFn(file);
  const url = uploaded?.file_url || uploaded?.url;
  if (!url) {
    throw new Error('Document upload did not return a file URL.');
  }
  return url;
}

/** Split typed cover letter from apps that embedded a file URL/key in the text. */
export function parseCoverLetterMaterials(coverLetter = '') {
  const raw = String(coverLetter || '');
  if (!raw.trim()) {
    return { text: '', fileUrl: '', fileName: '' };
  }

  const match = raw.match(FILE_MARKER_RE);
  if (!match) {
    return { text: raw.trim(), fileUrl: '', fileName: '' };
  }

  const fileName = match[1].trim();
  const fileUrl = match[2].trim();
  const text = raw.slice(0, match.index).replace(/\n---\s*$/, '').trim();

  return { text, fileUrl, fileName };
}

/**
 * Resolve cover-letter vs additional-document URLs, including legacy apps that
 * stored the cover letter only in `additional_document_url`.
 */
export function resolveApplicationDocuments({
  coverLetter = '',
  additionalDocumentUrl = '',
} = {}) {
  const parsed = parseCoverLetterMaterials(coverLetter);
  const stubMatch = ATTACHED_STUB_RE.exec(parsed.text);
  const stubText = Boolean(stubMatch);
  const stubFileName = stubMatch?.[1]?.trim() || '';
  const extraUrl = String(additionalDocumentUrl || '').trim();

  if (parsed.fileUrl) {
    const sameAsExtra = extraUrl && extraUrl === parsed.fileUrl;
    return {
      coverLetterUrl: parsed.fileUrl,
      coverLetterFileName:
        parsed.fileName || stubFileName || fileNameFromStorageKey(parsed.fileUrl) || 'PDF or document on file',
      coverLetterText: stubText ? '' : parsed.text,
      additionalDocumentUrl: sameAsExtra ? '' : extraUrl,
    };
  }

  if (extraUrl && (stubText || !parsed.text)) {
    return {
      coverLetterUrl: extraUrl,
      coverLetterFileName:
        stubFileName || fileNameFromStorageKey(extraUrl) || 'PDF or document on file',
      coverLetterText: '',
      additionalDocumentUrl: '',
    };
  }

  return {
    coverLetterUrl: '',
    coverLetterFileName: '',
    coverLetterText: stubText ? '' : parsed.text,
    additionalDocumentUrl: extraUrl,
  };
}

export function normalizeOptionalUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

/** Value shown in a field that already displays an https:// prefix. */
export function stripUrlProtocol(value = '') {
  return String(value || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^\/\//, '');
}
