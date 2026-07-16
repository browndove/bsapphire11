'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

function resizeToContent(el, { minHeight, maxHeight }) {
  if (!el) return;
  el.style.height = 'auto';
  const next = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
  el.style.height = `${next}px`;
  el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
}

export default function AutoResizeTextarea({
  value,
  onChange,
  minRows = 6,
  maxRows = 18,
  className = '',
  style,
  ...props
}) {
  const ref = useRef(null);
  const lineHeight = 1.4;
  const fontSize = 14; // 0.875rem at typical root
  const verticalPadding = 20; // ~0.65rem * 2
  const minHeight = Math.round(minRows * fontSize * lineHeight + verticalPadding);
  const maxHeight = Math.round(maxRows * fontSize * lineHeight + verticalPadding);

  useLayoutEffect(() => {
    resizeToContent(ref.current, { minHeight, maxHeight });
  }, [value, minHeight, maxHeight]);

  useEffect(() => {
    const onResize = () => resizeToContent(ref.current, { minHeight, maxHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [minHeight, maxHeight]);

  return (
    <textarea
      {...props}
      ref={ref}
      className={`ats-autoresize-textarea ${className}`.trim()}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        resizeToContent(e.target, { minHeight, maxHeight });
      }}
      style={{
        ...style,
        minHeight,
        maxHeight,
        resize: 'none',
        overflowY: 'hidden',
      }}
    />
  );
}
