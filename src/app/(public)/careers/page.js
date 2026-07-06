import CareersClient from './CareersClient';
import { fetchCareersPageData } from '@/lib/job-api/careers-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function Careers() {
  const { jobs, categories, company, error } = await fetchCareersPageData();

  return (
    <CareersClient
      initialJobs={jobs}
      initialCategories={categories}
      initialCompany={company}
      initialError={error}
    />
  );
}
