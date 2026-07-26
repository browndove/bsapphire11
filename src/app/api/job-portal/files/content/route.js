import { createHmac, timingSafeEqual } from 'crypto';
import { apiRequest, getBearerToken } from '@/lib/job-api/server';
import { toUserMessage } from '@/lib/job-api/errors';
import { NO_STORE_HEADERS } from '@/lib/job-api/dynamic-route';
import {
  fileNameFromStorageKey,
  isBrowsableFileUrl,
  sanitizeDownloadFileName,
} from '@/lib/job-api/cover-letter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const TICKET_TTL_MS = 2 * 60 * 1000;

function authHeaders(request) {
  const token = getBearerToken(request);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function ticketSecret() {
  return (
    process.env.JOB_PORTAL_FILE_TICKET_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'company-site-file-ticket-dev'
  );
}

function mintTicket(payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = createHmac('sha256', ticketSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyTicket(ticket) {
  const raw = String(ticket || '');
  const dot = raw.lastIndexOf('.');
  if (dot <= 0) return null;
  const body = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = createHmac('sha256', ticketSecret()).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload?.downloadUrl || !payload?.exp || Date.now() > Number(payload.exp)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function guessContentType(fileName = '', fallback = 'application/octet-stream') {
  const lower = String(fileName || '').toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  if (lower.endsWith('.txt')) return 'text/plain; charset=utf-8';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  return fallback;
}

function buildContentDisposition(disposition, fileName) {
  const safe = sanitizeDownloadFileName(fileName, 'document');
  const ascii = safe.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '');
  const encoded = encodeURIComponent(safe).replace(
    /['()]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
  return `${disposition}; filename="${ascii || 'document'}"; filename*=UTF-8''${encoded}`;
}

async function resolveUpstreamDownloadUrl(fileUrl, filename, request) {
  if (isBrowsableFileUrl(fileUrl)) {
    return fileUrl;
  }

  const data = await apiRequest(
    '/files/download-url',
    {
      method: 'POST',
      headers: authHeaders(request),
      body: JSON.stringify({
        file_url: fileUrl,
        filename: filename || undefined,
        response_content_disposition: filename
          ? `inline; filename="${sanitizeDownloadFileName(filename)}"`
          : undefined,
      }),
    },
    'download'
  );

  const url = data?.download_url || data?.url;
  if (!url) {
    const err = new Error('File download is not available yet.');
    err.status = 503;
    throw err;
  }
  return url;
}

async function streamNamedFile(downloadUrl, fileName, disposition) {
  const upstream = await fetch(downloadUrl, { cache: 'no-store' });
  if (!upstream.ok) {
    return Response.json(
      { message: 'Could not fetch the file from storage.' },
      { status: upstream.status === 404 ? 404 : 502, headers: NO_STORE_HEADERS }
    );
  }

  const contentType = upstream.headers.get('content-type') || guessContentType(fileName);
  const headers = new Headers(NO_STORE_HEADERS);
  headers.set('Content-Type', contentType);
  headers.set('Content-Disposition', buildContentDisposition(disposition, fileName));
  const length = upstream.headers.get('content-length');
  if (length) headers.set('Content-Length', length);

  return new Response(upstream.body, { status: 200, headers });
}

/**
 * Mint a short-lived ticket for viewing/downloading with the original filename.
 * POST { file_url, filename?, disposition?: "inline" | "attachment" }
 * → { ticket, filename, expires_at }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const fileUrl = String(body?.file_url || body?.url || '').trim();
    if (!fileUrl) {
      return Response.json(
        { message: 'No file to open.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const disposition = body?.disposition === 'attachment' ? 'attachment' : 'inline';
    const fileName = sanitizeDownloadFileName(
      body?.filename || fileNameFromStorageKey(fileUrl),
      'document'
    );

    const token = getBearerToken(request);
    if (!token && !isBrowsableFileUrl(fileUrl)) {
      return Response.json(
        { message: 'Sign in to download files.' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const downloadUrl = await resolveUpstreamDownloadUrl(fileUrl, fileName, request);
    const exp = Date.now() + TICKET_TTL_MS;
    const ticket = mintTicket({
      downloadUrl,
      filename: fileName,
      disposition,
      exp,
    });

    return Response.json(
      {
        ticket,
        filename: fileName,
        expires_at: new Date(exp).toISOString(),
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    return Response.json(
      { message: toUserMessage(err, 'download') },
      { status: err.status || 500, headers: NO_STORE_HEADERS }
    );
  }
}

/**
 * Open a ticketed file. Browser navigates here so Content-Disposition applies
 * to View / Save As with the candidate's original upload name.
 */
export async function GET(request) {
  try {
    const ticket = new URL(request.url).searchParams.get('ticket');
    const payload = verifyTicket(ticket);
    if (!payload) {
      return Response.json(
        { message: 'This file link has expired. Please open the file again.' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    return streamNamedFile(
      payload.downloadUrl,
      payload.filename || 'document',
      payload.disposition === 'attachment' ? 'attachment' : 'inline'
    );
  } catch (err) {
    return Response.json(
      { message: toUserMessage(err, 'download') },
      { status: err.status || 500, headers: NO_STORE_HEADERS }
    );
  }
}
