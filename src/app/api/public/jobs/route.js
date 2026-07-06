import { apiRequest } from '@/lib/job-api/server';
import { jsonRoute } from '@/lib/job-api/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request) {
  return jsonRoute(async () => {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== '_') params.set(key, value);
    });
    const query = params.toString();
    return apiRequest(`/jobs${query ? `?${query}` : ''}`);
  });
}
