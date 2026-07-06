import { apiRequest } from '@/lib/job-api/server';
import { jsonRoute } from '@/lib/job-api/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(_request, { params }) {
  return jsonRoute(async () => {
    const { id } = await params;
    return apiRequest(`/jobs/${id}`);
  });
}
