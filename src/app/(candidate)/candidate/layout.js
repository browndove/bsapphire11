'use client';

import { usePathname } from 'next/navigation';
import { CandidateProvider, useCandidate } from './CandidateContext';
import CandidateSidebar from './CandidateSidebar';
import { ConfirmProvider } from '@/components/ConfirmProvider';

function CandidateShell({ children }) {
  const pathname = usePathname();
  const { isReady, isAuthed } = useCandidate();
  const isAuthPage = pathname === '/candidate/login' || pathname === '/candidate/register';
  const isApplyPage = pathname === '/candidate/apply';

  if (isAuthPage) {
    return <div className="login-body">{children}</div>;
  }

  if (isApplyPage || (isReady && !isAuthed)) {
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
