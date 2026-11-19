import { apiRequest, getBearerToken } from '@/lib/job-api/server';
import { jsonRoute } from '@/lib/job-api/route';
import { getPaginatedItems } from '@/lib/job-api/mappers';
import {
  assertCanNotifyPositionFilled,
  buildPositionFilledStatusPatch,
} from '@/lib/job-api/position-filled';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/** Upstream often caps page size near 20 even when a higher limit is requested. */
const PAGE_SIZE = 20;

function authHeaders(request) {
  const token = getBearerToken(request);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function httpError(status, message, code) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

function unwrapJob(data) {
  return data?.data || data;
}

async function findJobApplication(jobId, applicationId, headers) {
  const target = String(applicationId);
  let offset = 0;
  let total = null;
  const seen = new Set();

  for (;;) {
    const listed = await apiRequest(
      `/employer/jobs/${jobId}/applications?limit=${PAGE_SIZE}&offset=${offset}`,
      { headers }
    );
    const rows = getPaginatedItems(listed);
    if (total == null && listed?.total != null && Number.isFinite(Number(listed.total))) {
      total = Number(listed.total);
    }

    for (const row of rows) {
      const id = String(row?.id ?? '');
      if (!id || seen.has(id)) continue;
      seen.add(id);
      if (id === target) return row;
    }

    const received = rows.length;
    offset += received;
    if (!received) break;
    if (total != null && seen.size >= total) break;
    if (received < PAGE_SIZE) break;
    if (seen.size >= 10000) break;
  }

  return null;
}

/**
 * Backend gate for position-filled emails.
 * Requires employer auth and a closed job, then sends one individual status email
 * through the existing upstream Resend path (never CC/BCC).
 */
export async function POST(request, { params }) {
  return jsonRoute(async () => {
    const token = getBearerToken(request);
    if (!token) {
      throw httpError(401, 'Sign in required.', 'unauthorized');
    }

    const { id: jobId } = await params;
    const body = await request.json();
    const applicationId = body?.application_id;
    if (!applicationId) {
      throw httpError(400, 'application_id is required.', 'validation');
    }

    const headers = authHeaders(request);
    const jobRaw = unwrapJob(await apiRequest(`/employer/jobs/${jobId}`, { headers }));
    const job = {
      id: jobRaw?.id || jobId,
      status: jobRaw?.status,
      title: jobRaw?.title,
    };

    try {
      assertCanNotifyPositionFilled(job, { isAuthed: true, isEmployer: true });
    } catch (err) {
      throw httpError(err.status || 409, err.message, err.code);
    }

    const appRaw = await findJobApplication(jobId, applicationId, headers);
    if (!appRaw) {
      throw httpError(404, 'Application not found for this job.', 'not_found');
    }

    const status = String(appRaw.status || '').toLowerCase();
    if (status === 'hired') {
      throw httpError(409, 'Selected candidates are not notified.', 'selected');
    }
    if (status === 'withdrawn') {
      throw httpError(409, 'Withdrawn applications are not notified.', 'withdrawn');
    }

    let patch;
    try {
      patch = buildPositionFilledStatusPatch({
        emailSubject: body.email_subject,
        emailBody: body.email_body,
        emailHtml: body.email_html,
      });
    } catch (err) {
      throw httpError(400, err.message, 'validation');
    }

    return apiRequest(
      `/employer/applications/${applicationId}/status`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(patch),
      },
      'status-email'
    );
  }, 'status-email');
}
