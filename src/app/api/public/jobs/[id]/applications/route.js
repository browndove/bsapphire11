import { apiRequest } from '@/lib/job-api/server';
import { jsonRoute } from '@/lib/job-api/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request, { params }) {
  return jsonRoute(async () => {
    const { id } = await params;
    const body = await request.json();
    return apiRequest(`/jobs/${id}/applications`, {
      method: 'POST',
      body: JSON.stringify(body),
    }, 'guest-apply');
  }, 'guest-apply');
}
