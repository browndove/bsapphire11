const FILE_MARKER_RE =
  /(?:^|\n)(?:---\n)?Cover letter file: (.+)\n(https?:\/\/\S+)\s*$/i;

/**
 * Build the `cover_letter` string the API expects (text only).
 * Uploaded files are linked in the body so employers can open them.
 */
export async function composeCoverLetter({ text = '', file = null, uploadFn }) {
  const typed = String(text || '').trim();

  if (!file) {
    if (!typed) {
      const err = new Error('Please write or upload a cover letter.');
      err.status = 400;
      throw err;
    }
    return typed;
  }

  if (typeof uploadFn !== 'function') {
    throw new Error('Cover letter upload is not available.');
  }

  const uploaded = await uploadFn(file);
  const url = uploaded?.file_url || uploaded?.url;
  if (!url) {
    throw new Error('Cover letter upload did not return a file URL.');
  }

  const marker = `Cover letter file: ${file.name}\n${url}`;

  let body = typed;
  if (
    !body &&
    (file.type === 'text/plain' || String(file.name || '').toLowerCase().endsWith('.txt'))
  ) {
    try {
      body = String(await file.text()).trim();
    } catch {
      body = '';
    }
  }

  return body ? `${body}\n\n---\n${marker}` : marker;
}

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
