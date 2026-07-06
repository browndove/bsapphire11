import { redirect } from 'next/navigation';
import { candidateApplyPath } from '@/lib/job-api/candidate-routes';

export const metadata = {
  title: 'Job Application | Blvck Sapphire',
};

export default async function Job({ searchParams }) {
  const params = await searchParams;
  const jobId = params?.id;
  if (jobId) redirect(candidateApplyPath(jobId));
  redirect('/careers');
}
