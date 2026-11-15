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

    const listed = await apiRequest(
      `/employer/jobs/${jobId}/applications?limit=500&offset=0`,
      { headers }
    );
    const rows = getPaginatedItems(listed);
    const appRaw = rows.find((row) => String(row.id) === String(applicationId));
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
