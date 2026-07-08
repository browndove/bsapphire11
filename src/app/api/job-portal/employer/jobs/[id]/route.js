import { apiRequest, getBearerToken } from '@/lib/job-api/server';
import { jsonRoute } from '@/lib/job-api/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function authHeaders(request) {
  const token = getBearerToken(request);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET(request, { params }) {
  return jsonRoute(async () => {
    const { id } = await params;
    return apiRequest(`/employer/jobs/${id}`, { headers: authHeaders(request) });
  });
}

export async function PATCH(request, { params }) {
  return jsonRoute(async () => {
    const { id } = await params;
    const body = await request.json();
    return apiRequest(`/employer/jobs/${id}`, {
      method: 'PATCH',
      headers: authHeaders(request),
      body: JSON.stringify(body),
    });
  });
}

export async function DELETE(request, { params }) {
  return jsonRoute(async () => {
    const { id } = await params;
    return apiRequest(`/employer/jobs/${id}`, {
      method: 'DELETE',
      headers: authHeaders(request),
    }, 'job');
  }, 'job');
}
