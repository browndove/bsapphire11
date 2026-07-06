import { apiRequest, getBearerToken } from '@/lib/job-api/server';
import { jsonRoute } from '@/lib/job-api/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function authHeaders(request) {
  const token = getBearerToken(request);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function PATCH(request, { params }) {
  return jsonRoute(async () => {
    const { id } = await params;
    return apiRequest(`/me/applications/${id}/withdraw`, {
      method: 'PATCH',
      headers: authHeaders(request),
    });
  });
}
