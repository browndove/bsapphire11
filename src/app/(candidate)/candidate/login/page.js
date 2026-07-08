'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCandidate } from '../CandidateContext';
import CandidateAuthForm from '@/components/candidate/CandidateAuthForm';
import { fetchPublicJob } from '@/lib/job-api/client';
import { jobIdFromReturnTo } from '@/lib/job-api/candidate-routes';
import { mapPublicJobFromApi } from '@/lib/job-api/mappers';
import BrandMark from '@/components/BrandMark';

function CandidateLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const applyJobId = jobIdFromReturnTo(returnTo);
  const [applyJobTitle, setApplyJobTitle] = useState('');
  const { isReady, isAuthed, login, completeLogin } = useCandidate();

  useEffect(() => {
    if (!applyJobId) return;
    let cancelled = false;
    fetchPublicJob(applyJobId)
      .then((data) => {
        if (!cancelled) setApplyJobTitle(mapPublicJobFromApi(data)?.title || '');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [applyJobId]);

  useEffect(() => {
    if (isReady && isAuthed) {
      router.replace(returnTo || '/candidate/applications');
    }
  }, [isReady, isAuthed, returnTo, router]);

  if (!isReady || isAuthed) return null;

  const registerHref = returnTo
    ? `/candidate/register?returnTo=${encodeURIComponent(returnTo)}`
    : '/candidate/register';

  return (
    <div className="login-shell">
      <div className="login-card ats-form">
        <div className="login-brand">
          <BrandMark size={28} />
          <span>Blvck Sapphire</span>
        </div>
        <h1>{applyJobTitle ? 'Apply for this role' : 'Candidate portal'}</h1>
        <p className="hint" style={{ marginBottom: '1.25rem' }}>
          {applyJobTitle
            ? <>Sign in to apply for <strong>{applyJobTitle}</strong>. After verification you&apos;ll complete your application in the candidate portal.</>
            : 'Sign in to track your job applications.'}
        </p>
        <CandidateAuthForm
          initialMode="login"
          showModeToggle={false}
          onCredentials={async (mode, fields) => login(fields.email, fields.password)}
          onVerify={completeLogin}
          onAuthenticated={() => router.push(returnTo || '/candidate/applications')}
        />
        <p className="login-meta">
          No account? <Link href={registerHref}>Create one</Link>
          {' · '}
          <Link href="/careers">Browse open roles</Link>
        </p>
      </div>
    </div>
  );
}

export default function CandidateLogin() {
  return (
    <Suspense fallback={null}>
      <CandidateLoginInner />
    </Suspense>
  );
}
