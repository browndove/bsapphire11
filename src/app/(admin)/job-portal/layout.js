'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { PortalProvider, usePortal } from './PortalContext';
import PortalSidebar from './PortalSidebar';
import { ConfirmProvider } from '@/components/ConfirmProvider';

function PreviewBanner() {
  const { isPreview } = usePortal();
  if (!isPreview) return null;
  return (
    <div className="ats-preview-banner" role="status">
      Preview mode — sample data only. Set <code>NEXT_PUBLIC_JOB_PORTAL_PREVIEW=false</code> to require login.
    </div>
  );
}

function PortalContent({ children }) {
  const pathname = usePathname();
  const isLogin = pathname === '/job-portal/login';

  if (isLogin) {
    return <div className="login-body">{children}</div>;
  }

  return (
    <div className="portal-shell">
      <PortalSidebar />
      <div className="portal-content">
        <PreviewBanner />
        <main className="portal-main">{children}</main>
      </div>
    </div>
  );
}

export default function JobPortalLayout({ children }) {
  return (
    <PortalProvider>
      <ConfirmProvider>
        <PortalContent>{children}</PortalContent>
      </ConfirmProvider>
    </PortalProvider>
  );
}
