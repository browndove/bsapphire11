import { apiRequest } from './server';
import { toUserMessage } from './errors';
import { getPaginatedItems, mapPublicJobFromApi } from './mappers';

export async function fetchCareersPageData() {
  try {
    const [jobsRes, categoriesRes, companyRes] = await Promise.all([
      apiRequest('/jobs?limit=100&offset=0'),
      apiRequest('/categories'),
      apiRequest('/company').catch(() => null),
    ]);

    const categories = getPaginatedItems(categoriesRes);
    const byId = Object.fromEntries(categories.map((c) => [c.id, c]));
    const jobs = getPaginatedItems(jobsRes)
      .filter((job) => job.status === 'published' || !job.status)
      .map((job) => mapPublicJobFromApi(job, byId))
      .filter(Boolean);

    return {
      jobs,
      categories,
      company: companyRes?.data ?? companyRes ?? null,
      error: '',
    };
  } catch (err) {
    return {
      jobs: [],
      categories: [],
      company: null,
      error: toUserMessage(err),
    };
  }
}
