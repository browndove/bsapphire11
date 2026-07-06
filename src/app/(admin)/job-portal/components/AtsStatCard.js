'use client';

import Link from 'next/link';

export default function AtsStatCard({ label, value, href }) {
  const content = (
    <>
      <div className="ats-stat-label">{label}</div>
      <div className="ats-stat-value">{value}</div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="ats-stat-card is-link">
        {content}
      </Link>
    );
  }

  return <div className="ats-stat-card">{content}</div>;
}
