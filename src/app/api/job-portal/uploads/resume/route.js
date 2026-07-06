import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { getBearerToken } from '@/lib/job-api/server';
import { RESUME_MAX_BYTES, RESUME_MIME_TYPES } from '@/lib/job-api/resume-upload';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'resumes');

function requestOrigin(request) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  if (forwardedHost) {
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    return `${proto}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
}

function sanitizeFilename(name) {
  const base = path.basename(name || 'resume').replace(/[^a-zA-Z0-9._-]/g, '_');
  const ext = path.extname(base).toLowerCase();
  const stem = path.basename(base, ext).slice(0, 80) || 'resume';
  const allowedExt = ['.pdf', '.doc', '.docx'];
  const safeExt = allowedExt.includes(ext) ? ext : '.pdf';
  return `${stem}${safeExt}`;
}

function isAllowedFile(file) {
  if (!file || typeof file.arrayBuffer !== 'function') return false;
  if (file.size > RESUME_MAX_BYTES) return false;
  const ext = path.extname(file.name || '').toLowerCase();
  const allowedExt = ['.pdf', '.doc', '.docx'];
  return RESUME_MIME_TYPES.has(file.type) || allowedExt.includes(ext);
}

export async function POST(request) {
  const token = getBearerToken(request);
  if (!token) {
    return Response.json({ message: 'Sign in to upload a resume.' }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ message: 'Invalid upload payload.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!isAllowedFile(file)) {
    return Response.json(
      { message: 'Upload a PDF or Word resume up to 5 MB.' },
      { status: 400 }
    );
  }

  const storedName = `${randomUUID()}-${sanitizeFilename(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, storedName), buffer);

  const url = `${requestOrigin(request)}/uploads/resumes/${storedName}`;
  return Response.json({ url, filename: file.name, size: file.size });
}
