'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCandidate } from './CandidateContext';
import { IconApplications, IconProfile } from '@/app/(admin)/job-portal/components/PortalIcons';
import { useConfirm } from '@/components/ConfirmProvider';

const NAV = [
  { href: '/candidate/applications', label: 'My applications', Icon: IconApplications },
  { href: '/candidate/profile', label: 'Profile', Icon: IconProfile },
];

export default function CandidateSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useCandidate();
  const confirm = useConfirm();

  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || 'Candidate';
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <aside className="portal-sidebar">
      <div className="portal-sidebar-top">
        <Link href="/candidate/applications" className="portal-brand">
          <span className="portal-brand-mark" aria-hidden="true" />
          <div className="portal-brand-text">
            <strong>Blvck Sapphire</strong>
            <span>Candidate</span>
          </div>
        </Link>

        <Link href="/careers" className="btn btn-outline portal-sidebar-cta">
          Browse jobs
        </Link>
      </div>

      <nav className="portal-sidebar-nav" aria-label="Candidate navigation">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`portal-sidebar-link ${pathname.startsWith(item.href) ? 'is-active' : ''}`}
          >
            <item.Icon className="ats-icon" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="portal-sidebar-bottom">
        <div className="portal-sidebar-user-card">
          <div className="portal-sidebar-user-row">
            <span className="portal-sidebar-user-avatar" aria-hidden="true">{initials}</span>
            <div className="portal-sidebar-user-meta">
              <span className="portal-sidebar-user-label">Signed in</span>
              <span className="portal-sidebar-user-email">{user?.email || name}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm portal-sidebar-signout"
            onClick={async (e) => {
              e.preventDefault();
              const ok = await confirm({
                title: 'Sign out?',
                message: 'You will need to sign in again to view your applications.',
                confirmText: 'Sign out',
                cancelText: 'Cancel',
                variant: 'danger',
              });
              if (!ok) return;
              await logout();
              router.replace('/candidate/login');
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
