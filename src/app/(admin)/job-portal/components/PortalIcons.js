const base = { viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function IconDashboard(props) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="2.5" width="6" height="3.5" rx="1" />
      <rect x="11.5" y="8.5" width="6" height="9" rx="1" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1" />
    </svg>
  );
}

export function IconJobs(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6.5h12v10.5H4z" />
      <path d="M7 6.5V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
      <path d="M8 10.5h4M8 13.5h2.5" />
    </svg>
  );
}

export function IconCandidates(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="7" r="3" />
      <path d="M4.5 17c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    </svg>
  );
}

export function IconSearch(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="9" r="5" />
      <path d="M13.5 13.5L17 17" />
    </svg>
  );
}

export function IconMore(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="5" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="10" cy="10" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="10" cy="15" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconUsers(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="8" cy="8" r="2.5" />
      <path d="M3.5 16c0-2.5 2-4.5 4.5-4.5" />
      <circle cx="13.5" cy="9" r="2" />
      <path d="M11 16c0-2 1.5-3.5 3.5-3.5.8 0 1.5.2 2.1.6" />
    </svg>
  );
}

export function IconApplications(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5.5h12v11H4z" />
      <path d="M7 3.5h6v2H7z" />
      <path d="M7 9.5h6M7 12h4" />
    </svg>
  );
}

export function IconSettings(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="2.25" />
      <path d="M10 2.5v2M10 15.5v2M4.4 4.4l1.6 1.6M14 14l1.6 1.6M2.5 10h2M15.5 10h2M4.4 15.6l1.6-1.6M14 6l1.6-1.6" />
    </svg>
  );
}

export function IconProfile(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="7" r="3" />
      <path d="M4.5 17c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    </svg>
  );
}

export function IconBriefcase(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 7h13v9.5h-13z" />
      <path d="M7 7V5.5A1.5 1.5 0 0 1 8.5 4h3A1.5 1.5 0 0 1 13 5.5V7" />
    </svg>
  );
}

export function IconInbox(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 5.5h13v9H3.5z" />
      <path d="M3.5 11h3.5l1.5 2h5l1.5-2H16.5" />
    </svg>
  );
}

const ICONS = {
  dashboard: IconDashboard,
  jobs: IconJobs,
  candidates: IconCandidates,
  search: IconSearch,
  users: IconUsers,
  briefcase: IconBriefcase,
  inbox: IconInbox,
  applications: IconApplications,
  settings: IconSettings,
  profile: IconProfile,
};

export function PortalIcon({ name, className = 'ats-icon' }) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} aria-hidden="true" />;
}
