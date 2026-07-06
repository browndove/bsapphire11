import { apiRequest, getBearerToken } from '@/lib/job-api/server';
import { jsonRoute } from '@/lib/job-api/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request) {
  return jsonRoute(async () => {
    const token = getBearerToken(request);
    return apiRequest('/auth/logout', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  });
}
