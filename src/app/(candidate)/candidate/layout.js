'use client';

import { usePathname } from 'next/navigation';
import { CandidateProvider } from './CandidateContext';
import CandidateSidebar from './CandidateSidebar';
import { ConfirmProvider } from '@/components/ConfirmProvider';

function CandidateShell({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/candidate/login' || pathname === '/candidate/register';

  if (isAuthPage) {
    return <div className="login-body">{children}</div>;
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
