'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { PortalProvider } from './PortalContext';
import PortalSidebar from './PortalSidebar';

function PortalContent({ children }) {
  const pathname = usePathname();
  const isLogin = pathname === '/job-portal/login';

  if (isLogin) {
    return <div className="login-body">{children}</div>;
  }

  return (
    <div className="portal-shell">
      <PortalSidebar />
      <div className="portal-main">
        {children}
      </div>
    </div>
  );
}

export default function JobPortalLayout({ children }) {
  return (
    <PortalProvider>
      <PortalContent>
        {children}
      </PortalContent>
    </PortalProvider>
  );
}
