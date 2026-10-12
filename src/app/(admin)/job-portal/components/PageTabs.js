'use client';

import { useEffect, useRef, useState } from 'react';

export default function PageTabs({ tabs, active, onChange }) {
  const listRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const list = listRef.current;
    const current = list?.querySelector('.is-active');
    if (!list || !current) return;
    setIndicator({ left: current.offsetLeft, width: current.offsetWidth });
    current.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, [active, tabs]);

  return (
    <div className="ats-tabs" role="tablist" ref={listRef}>
      <span
        className="ats-tab-indicator"
        style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          className={`ats-tab ${active === tab.id ? 'is-active' : ''}${tab.error ? ' has-error' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count != null ? ` (${tab.count})` : ''}
          {tab.error ? <span className="ats-tab-dot" aria-label="Needs attention" /> : null}
        </button>
      ))}
    </div>
  );
}
