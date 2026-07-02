'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePortal } from './PortalContext';

export default function PortalSidebar() {
  const pathname = usePathname();
  const { logout } = usePortal();

  // Highlight 'applications' for detail page as well
  const getActiveState = (path) => {
    if (pathname === '/job-portal' && path === '/job-portal/dashboard') return 'is-active';
    if (pathname.startsWith('/job-portal/applications') && path === '/job-portal/applications') return 'is-active';
    if (pathname.startsWith('/job-portal/postings') && path === '/job-portal/postings' && !pathname.includes('/edit')) return 'is-active';
    if (pathname.startsWith('/job-portal/postings/edit') && path === '/job-portal/postings/edit') return 'is-active';
    return pathname === path ? 'is-active' : '';
  };

  return (
    <aside className="portal-sidebar">
      <div className="portal-brand">Blvck Sapphire<span>Recruiting portal</span></div>
      <nav className="portal-nav">
        <Link href="/job-portal/dashboard" className={getActiveState('/job-portal/dashboard')}>Dashboard</Link>
        <Link href="/job-portal/postings" className={getActiveState('/job-portal/postings')}>Job postings</Link>
        <Link href="/job-portal/postings/edit" className={getActiveState('/job-portal/postings/edit')}>New posting</Link>
        <Link href="/job-portal/applications" className={getActiveState('/job-portal/applications')}>Applications inbox</Link>
      </nav>
      <div className="portal-sidebar-footer">
        <p>Prototype: data saves in this browser. Connect your API when ready.</p>
        <button 
          type="button" 
          className="btn btn-ghost btn-sm" 
          onClick={(e) => {
            e.preventDefault();
            logout();
          }}
          style={{ marginTop: '0.75rem', width: '100%' }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
