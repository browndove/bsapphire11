export function candidateApplyPath(jobId) {
  return `/candidate/apply?jobId=${encodeURIComponent(jobId)}`;
}

export function candidateLoginForJob(jobId) {
  return `/candidate/login?returnTo=${encodeURIComponent(candidateApplyPath(jobId))}`;
}

export function jobIdFromReturnTo(returnTo) {
  if (!returnTo) return null;
  try {
    const url = new URL(returnTo, 'http://localhost');
    if (url.pathname === '/candidate/apply') {
      return url.searchParams.get('jobId');
    }
    if (url.pathname === '/job') {
      return url.searchParams.get('id');
    }
  } catch {
    return null;
  }
  return null;
}
