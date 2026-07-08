'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { IconMore } from './PortalIcons';

export default function ActionsMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="ats-menu" ref={ref}>
      <button
        type="button"
        className="ats-menu-trigger"
        aria-label="Actions"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <IconMore className="ats-icon" />
      </button>
      {open ? (
        <div className="ats-menu-dropdown" role="menu">
          {items.map((item) =>
            item.onClick ? (
              <button
                key={item.label}
                type="button"
                className={`ats-menu-item${item.danger ? ' is-danger' : ''}`}
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  item.onClick();
                }}
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`ats-menu-item${item.danger ? ' is-danger' : ''}`}
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}
