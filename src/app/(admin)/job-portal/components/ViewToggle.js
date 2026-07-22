'use client';

export default function ViewToggle({ value, onChange, options }) {
  const tabs = options || [
    { id: 'board', label: 'Board' },
    { id: 'list', label: 'List' },
  ];

  return (
    <div className="ats-view-toggle">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={value === tab.id ? 'is-active' : ''}
          onClick={() => onChange(tab.id)}
          disabled={tab.disabled}
          title={tab.title || undefined}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
