'use client';

export default function PageTabs({ tabs, active, onChange }) {
  return (
    <div className="ats-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          className={`ats-tab ${active === tab.id ? 'is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count != null ? ` (${tab.count})` : ''}
        </button>
      ))}
    </div>
  );
}
