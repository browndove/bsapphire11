/**
 * Cover letters are file uploads only.
 * Uploaded files go to `additional_document_url`; `cover_letter` keeps a short stub for the API.
 */
export async function composeCoverLetterMaterials({ file = null, uploadFn }) {
  if (!file) {
    const err = new Error('Please upload a cover letter.');
    err.status = 400;
    throw err;
  }

  if (typeof uploadFn !== 'function') {
    throw new Error('Cover letter upload is not available.');
  }

  const uploaded = await uploadFn(file);
  const url = uploaded?.file_url || uploaded?.url;
  if (!url) {
    throw new Error('Cover letter upload did not return a file URL.');
  }

  let coverLetter = '';
  if (file.type === 'text/plain' || String(file.name || '').toLowerCase().endsWith('.txt')) {
    try {
      coverLetter = String(await file.text()).trim();
    } catch {
      coverLetter = '';
    }
  }

  if (!coverLetter) {
    coverLetter = 'See attached cover letter.';
  }

  return { coverLetter, additionalDocumentUrl: url };
}

const LEGACY_FILE_MARKER_RE =
  /(?:^|\n)(?:---\n)?Cover letter file: (.+)\n(https?:\/\/\S+)\s*$/i;

/** Split typed cover letter from older apps that embedded a file URL in the text. */
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

export function normalizeOptionalUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
