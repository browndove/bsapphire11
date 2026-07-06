'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePortal } from './PortalContext';
import { IconCandidates, IconDashboard, IconJobs, IconSettings } from './components/PortalIcons';
import { useConfirm } from '@/components/ConfirmProvider';

const NAV = [
  { href: '/job-portal/dashboard', label: 'Dashboard', Icon: IconDashboard },
  { href: '/job-portal/postings', label: 'Jobs', Icon: IconJobs },
  { href: '/job-portal/applications', label: 'Candidates', Icon: IconCandidates },
  { href: '/job-portal/settings', label: 'Settings', Icon: IconSettings },
];

export default function PortalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = usePortal();
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

  return (
    <aside className="portal-sidebar">
      <div className="portal-sidebar-top">
        <Link href="/job-portal/dashboard" className="portal-brand">
          <span className="portal-brand-mark" aria-hidden="true" />
          <div className="portal-brand-text">
            <strong>Blvck Sapphire</strong>
            <span>Employer</span>
          </div>
        </Link>

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
          >
            <item.Icon className="ats-icon" />
            <span>{item.label}</span>
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
        </div>
      </div>
    </aside>
  );
}
