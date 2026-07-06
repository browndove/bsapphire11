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
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    return apiRequest(`/employer/jobs/${id}/applications${query ? `?${query}` : ''}`, {
      headers: authHeaders(request),
    });
  });
}
