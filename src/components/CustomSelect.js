'use client';

import { useEffect, useId, useRef, useState } from 'react';

function IconChevron({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCheck({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CustomSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  className = '',
  required = false,
}) {
  const autoId = useId();
  const selectId = id || autoId;
  const listboxId = `${selectId}-listbox`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected = options.find((opt) => opt.value === value);
  const displayLabel = selected?.label || placeholder;
  const isPlaceholder = !selected;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const pick = (next) => {
    onChange?.(next);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`custom-select ${open ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''} ${className}`.trim()}
    >
      {name ? <input type="hidden" name={name} value={value || ''} required={required} /> : null}
      <button
        type="button"
        id={selectId}
        className={`custom-select-trigger ${isPlaceholder ? 'is-placeholder' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <span className="custom-select-value">{displayLabel}</span>
        <IconChevron className="custom-select-chevron" />
      </button>

      {open ? (
        <ul id={listboxId} className="custom-select-menu" role="listbox" aria-labelledby={selectId}>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`custom-select-option ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => pick(opt.value)}
                >
                  <span className="custom-select-option-check" aria-hidden="true">
                    {isSelected ? <IconCheck /> : null}
                  </span>
                  <span>{opt.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
