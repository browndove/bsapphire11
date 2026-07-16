/**
 * Cover letters are file uploads when provided.
 * File URL is encoded in `cover_letter` so `additional_document_url` stays free for extras.
 */
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
    return { coverLetter: '' };
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

  const marker = `Cover letter file: ${file.name}\n${url}`;
  return {
    coverLetter: body ? `${body}\n\n---\n${marker}` : marker,
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

const LEGACY_FILE_MARKER_RE =
  /(?:^|\n)(?:---\n)?Cover letter file: (.+)\n(https?:\/\/\S+)\s*$/i;

/** Split typed cover letter from apps that embedded a file URL in the text. */
export function parseCoverLetterMaterials(coverLetter = '') {
  const raw = String(coverLetter || '');
  if (!raw.trim()) {
    return { text: '', fileUrl: '', fileName: '' };
  }

  const match = raw.match(LEGACY_FILE_MARKER_RE);
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
  const stubText = /^see attached cover letter\.?$/i.test(parsed.text);

  if (parsed.fileUrl) {
    return {
      coverLetterUrl: parsed.fileUrl,
      coverLetterFileName: parsed.fileName || 'PDF or document on file',
      coverLetterText: stubText ? '' : parsed.text,
      additionalDocumentUrl: additionalDocumentUrl || '',
    };
  }

  if (additionalDocumentUrl && (stubText || !parsed.text)) {
    return {
      coverLetterUrl: additionalDocumentUrl,
      coverLetterFileName: 'PDF or document on file',
      coverLetterText: '',
      additionalDocumentUrl: '',
    };
  }

  return {
    coverLetterUrl: '',
    coverLetterFileName: '',
    coverLetterText: stubText ? '' : parsed.text,
    additionalDocumentUrl: additionalDocumentUrl || '',
  };
}

export function normalizeOptionalUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
