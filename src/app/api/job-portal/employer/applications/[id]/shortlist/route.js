import { apiRequest, getBearerToken } from '@/lib/job-api/server';
import { jsonRoute } from '@/lib/job-api/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function authHeaders(request) {
  const token = getBearerToken(request);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function shortlist(request, { params }) {
  return jsonRoute(async () => {
    const { id } = await params;
    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    return apiRequest(`/employer/applications/${id}/shortlist`, {
      method: 'POST',
      headers: authHeaders(request),
      body: JSON.stringify(body && typeof body === 'object' ? body : {}),
    });
  });
}

export async function POST(request, ctx) {
  return shortlist(request, ctx);
}

export async function PATCH(request, ctx) {
  return shortlist(request, ctx);
}
