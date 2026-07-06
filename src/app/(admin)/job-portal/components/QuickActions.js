'use client';

export default function QuickActions({ currentStatus, onAction, saving }) {
  const actions = [
    { status: 'shortlisted', label: 'Shortlist', variant: 'btn-outline' },
    { status: 'interview', label: 'Interview', variant: 'btn-outline' },
    { status: 'hired', label: 'Hire', variant: 'btn-primary' },
    { status: 'rejected', label: 'Reject', variant: 'btn-danger' },
  ];

  return (
    <div className="ats-quick-actions">
      {actions.map((action) => (
        <button
          key={action.status}
          type="button"
          className={`btn btn-sm ${action.variant} ${currentStatus === action.status ? 'is-active' : ''}`}
          disabled={saving || currentStatus === action.status}
          onClick={() => onAction(action.status)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
