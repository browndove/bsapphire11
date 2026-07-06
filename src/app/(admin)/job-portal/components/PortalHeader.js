'use client';

import Link from 'next/link';
import { IconSearch } from './PortalIcons';

export default function PortalHeader({
  title,
  breadcrumb,
  badge,
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  action,
}) {
  return (
    <header className="ats-header">
      <div className="ats-header-left">
        {breadcrumb ? (
          <nav className="ats-breadcrumb" aria-label="Breadcrumb">
            {breadcrumb}
          </nav>
        ) : null}
        {title ? (
          <h1 className="ats-header-title">
            {title}
            {badge != null ? <span className="ats-badge">{badge}</span> : null}
          </h1>
        ) : badge != null ? (
          <span className="ats-badge">{badge}</span>
        ) : null}
      </div>
      <div className="ats-header-right">
        {search != null ? (
          <div className="ats-header-search ats-form">
            <div className="ats-input-icon">
            <IconSearch className="ats-icon ats-icon-sm" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
            />
            </div>
          </div>
        ) : null}
        {action}
      </div>
    </header>
  );
}

export function BreadcrumbLink({ href, children }) {
  return <Link href={href}>{children}</Link>;
}
