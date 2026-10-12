'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PortalProvider, usePortal } from './PortalContext';
import PortalSidebar from './PortalSidebar';
import { PortalNavProvider } from './PortalNavContext';
import { ConfirmProvider } from '@/components/ConfirmProvider';
import BrandMark from '@/components/BrandMark';
import { readNavHidden, readPortalTheme, writeNavHidden } from '@/lib/job-api/portal-ui';

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
  const router = useRouter();
  const { isReady, isAuthed, isPreview } = usePortal();
  const [navOpen, setNavOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const isLogin = pathname === '/job-portal/login';
  const needsLogin = isReady && !isAuthed && !isPreview && !isLogin;

  useEffect(() => {
    document.documentElement.dataset.portalTheme = readPortalTheme();
    setNavHidden(readNavHidden());
  }, []);

  const hideNav = () => {
    setNavHidden(true);
    writeNavHidden(true);
    setNavOpen(false);
  };

  const showNav = () => {
    setNavHidden(false);
    writeNavHidden(false);
    setNavOpen(false);
  };

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (needsLogin) router.replace('/job-portal/login');
  }, [needsLogin, router]);

  if (isLogin) {
    return <div className="login-body">{children}</div>;
  }

  if (!isReady || needsLogin) {
    return (
      <div className="login-body ats-boot">
        <BrandMark size={36} />
        <div className="ats-boot-spinner" aria-label="Loading portal" />
      </div>
    );
  }

  return (
    <PortalNavProvider hidden={navHidden} show={showNav}>
    <div className={`portal-shell${navHidden ? ' is-nav-hidden' : ''}`}>
      <button
        type="button"
        className="portal-nav-toggle"
        aria-label="Open navigation"
        aria-expanded={navOpen}
        onClick={() => setNavOpen((open) => !open)}
      >
        Menu
      </button>
      {navOpen ? <button type="button" className="portal-nav-backdrop" aria-label="Close navigation" onClick={() => setNavOpen(false)} /> : null}
      <PortalSidebar open={navOpen} onNavigate={() => setNavOpen(false)} onHide={hideNav} />
      <div className="portal-content">
        <PreviewBanner />
        <main className="portal-main">{children}</main>
      </div>
    </div>
    </PortalNavProvider>
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
