'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCandidate } from '../CandidateContext';
import CandidateAuthForm from '@/components/candidate/CandidateAuthForm';
import { candidateApplyPath, jobIdFromReturnTo } from '@/lib/job-api/candidate-routes';
import BrandMark from '@/components/BrandMark';

function CandidateLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const applyJobId = jobIdFromReturnTo(returnTo);
  const { isReady, isAuthed, login, completeLogin } = useCandidate();

  useEffect(() => {
    if (isReady && isAuthed) {
      router.replace(returnTo || '/candidate/applications');
    }
  }, [isReady, isAuthed, returnTo, router]);

  if (!isReady || isAuthed) return null;

  return (
    <div className="login-shell">
      <div className="login-card ats-form">
        <div className="login-brand">
          <BrandMark size={28} />
          <span>Blvck Sapphire</span>
        </div>
        <h1>Candidate portal</h1>
        <p className="hint" style={{ marginBottom: '1.25rem' }}>
          Sign in to view applications you submitted with an existing account.
          {' '}
          {applyJobId ? (
            <>
              To apply for a role, use the{' '}
              <Link href={candidateApplyPath(applyJobId)}>application form</Link>
              {' '}— no account needed.
            </>
          ) : (
            <>New applications do not require an account — apply from the careers page.</>
          )}
        </p>
        <CandidateAuthForm
          initialMode="login"
          showModeToggle={false}
          onCredentials={async (_mode, fields) => login(fields.email, fields.password)}
          onVerify={completeLogin}
          onAuthenticated={() => router.push(returnTo || '/candidate/applications')}
        />
        <p className="login-meta">
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
