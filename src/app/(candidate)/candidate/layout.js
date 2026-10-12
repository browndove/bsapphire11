'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CandidateProvider, useCandidate } from './CandidateContext';
import CandidateSidebar from './CandidateSidebar';
import { ConfirmProvider } from '@/components/ConfirmProvider';

function CandidateShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isReady, isAuthed } = useCandidate();
  const isAuthPage = pathname === '/candidate/login' || pathname === '/candidate/register';
  const isApplyPage = pathname === '/candidate/apply';
  const needsLogin = isReady && !isAuthed && !isAuthPage && !isApplyPage;

  useEffect(() => {
    if (needsLogin) router.replace('/candidate/login');
  }, [needsLogin, router]);

  if (isAuthPage) {
    return <div className="login-body">{children}</div>;
  }

  if (needsLogin || (!isReady && !isApplyPage)) {
    return <div className="login-body" />;
  }

  if (isApplyPage && !isAuthed) {
    return (
      <div className="portal-content portal-guest-shell">
        <main className="portal-main portal-main-guest">{children}</main>
      </div>
    );
  }

  return (
    <div className="portal-shell">
      <CandidateSidebar />
      <div className="portal-content">
        <main className="portal-main">{children}</main>
      </div>
    </div>
  );
}

export default function CandidateLayout({ children }) {
  return (
    <CandidateProvider>
      <ConfirmProvider>
        <CandidateShell>{children}</CandidateShell>
      </ConfirmProvider>
    </CandidateProvider>
  );
}
