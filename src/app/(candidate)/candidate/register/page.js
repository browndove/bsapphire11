'use client';

import { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCandidate } from '../CandidateContext';
import CandidateAuthForm from '@/components/candidate/CandidateAuthForm';

function CandidateRegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const { isReady, isAuthed, register, login, completeLogin } = useCandidate();

  useEffect(() => {
    if (isReady && isAuthed) {
      router.replace(returnTo || '/candidate/applications');
    }
  }, [isReady, isAuthed, returnTo, router]);

  if (!isReady || isAuthed) return null;

  const loginHref = returnTo
    ? `/candidate/login?returnTo=${encodeURIComponent(returnTo)}`
    : '/candidate/login';

  return (
    <div className="login-shell">
      <div className="login-card ats-form">
        <h1>Create candidate account</h1>
        <CandidateAuthForm
          showFlowSteps
          initialMode="register"
          showModeToggle={false}
          onCredentials={async (mode, fields) => {
            if (mode === 'register') return register(fields);
            return login(fields.email, fields.password);
          }}
          onVerify={completeLogin}
          onAuthenticated={() => {
            router.push(returnTo || '/candidate/applications');
          }}
        />
        <p className="login-meta" style={{ marginTop: '1.25rem' }}>
          Already have an account? <Link href={loginHref}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function CandidateRegister() {
  return (
    <Suspense fallback={null}>
      <CandidateRegisterInner />
    </Suspense>
  );
}
