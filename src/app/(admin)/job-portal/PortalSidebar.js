'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePortal } from './PortalContext';
import { IconCandidates, IconDashboard, IconJobs, IconSettings } from './components/PortalIcons';
import { useConfirm } from '@/components/ConfirmProvider';
import BrandMark from '@/components/BrandMark';
import { readPortalTheme, writePortalTheme } from '@/lib/job-api/portal-ui';

const NAV = [
  { href: '/job-portal/dashboard', label: 'Dashboard', Icon: IconDashboard },
  { href: '/job-portal/postings', label: 'Jobs', Icon: IconJobs },
  { href: '/job-portal/applications', label: 'Candidates', Icon: IconCandidates },
  { href: '/job-portal/settings', label: 'Settings', Icon: IconSettings },
];

export default function PortalSidebar({ open = false, onNavigate, onHide }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user, applications, jobs } = usePortal();
  const [theme, setTheme] = useState('light');
  const confirm = useConfirm();

  const isActive = (href) => {
    if (href === '/job-portal/dashboard') {
      return pathname === '/job-portal' || pathname === '/job-portal/dashboard';
    }
    if (href === '/job-portal/applications') {
      return pathname.startsWith('/job-portal/applications');
    }
    if (href === '/job-portal/postings') {
      return pathname.startsWith('/job-portal/postings');
    }
    if (href === '/job-portal/settings') {
      return pathname.startsWith('/job-portal/settings');
    }
    return pathname === href;
  };

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '?';
  const submittedCount = applications.filter((app) => app.status === 'submitted').length;
  const draftCount = jobs.filter((job) => job.status === 'draft').length;

  useEffect(() => {
    const stored = readPortalTheme();
    setTheme(stored);
    document.documentElement.dataset.portalTheme = stored;
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    writePortalTheme(next);
    document.documentElement.dataset.portalTheme = next;
  };

  return (
    <aside className={`portal-sidebar${open ? ' is-open' : ''}`}>
      <div className="portal-sidebar-top">
        <div className="portal-sidebar-brand-row">
          <Link href="/job-portal/dashboard" className="portal-brand">
            <span className="portal-brand-mark" aria-hidden="true">
              <BrandMark size={18} />
            </span>
            <div className="portal-brand-text">
              <strong>Blvck Sapphire</strong>
              <span>Employer</span>
            </div>
          </Link>
          {onHide ? (
            <button type="button" className="portal-sidebar-hide" onClick={onHide}>
              Hide
            </button>
          ) : null}
        </div>

        <Link href="/job-portal/postings/edit" className="btn btn-primary portal-sidebar-cta">
          Post a job
        </Link>
      </div>

      <nav className="portal-sidebar-nav" aria-label="Employer navigation">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`portal-sidebar-link ${isActive(item.href) ? 'is-active' : ''}`}
            onClick={() => onNavigate?.()}
          >
            <item.Icon className="ats-icon" />
            <span>{item.label}</span>
            {item.href === '/job-portal/applications' && submittedCount > 0 ? (
              <span className="portal-nav-badge">{submittedCount}</span>
            ) : null}
            {item.href === '/job-portal/postings' && draftCount > 0 ? (
              <span className="portal-nav-badge">{draftCount}</span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="portal-sidebar-bottom">
        <Link href="/careers" className="portal-sidebar-external" target="_blank" rel="noreferrer">
          View careers site
          <span aria-hidden="true">↗</span>
        </Link>

        <div className="portal-sidebar-user-card">
          <div className="portal-sidebar-user-row">
            <span className="portal-sidebar-user-avatar" aria-hidden="true">{initials}</span>
            <div className="portal-sidebar-user-meta">
              <span className="portal-sidebar-user-label">Signed in</span>
              <span className="portal-sidebar-user-email">{user?.email || 'Employer'}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm portal-sidebar-signout"
            onClick={async (e) => {
              e.preventDefault();
              const ok = await confirm({
                title: 'Sign out?',
                message: 'You will need to sign in again to access the employer portal.',
                confirmText: 'Sign out',
                cancelText: 'Cancel',
                variant: 'danger',
              });
              if (!ok) return;
              await logout();
              router.replace('/job-portal/login');
            }}
          >
            Sign out
          </button>
          <button type="button" className="btn btn-outline btn-sm portal-sidebar-signout" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </div>
    </aside>
  );
}
