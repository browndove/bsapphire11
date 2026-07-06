import { apiRequest } from '@/lib/job-api/server';
import { jsonRoute } from '@/lib/job-api/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request) {
  return jsonRoute(async () => {
    const body = await request.json();
    return apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }, 'login');
  }, 'login');
}
