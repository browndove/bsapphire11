'use client';

import { getInitials } from '@/lib/job-api/format';

const PALETTES = [
  { bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8' },
  { bg: '#ede9fe', border: '#c4b5fd', text: '#6d28d9' },
  { bg: '#dcfce7', border: '#86efac', text: '#15803d' },
  { bg: '#ffedd5', border: '#fdba74', text: '#c2410c' },
  { bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c' },
  { bg: '#e0f2fe', border: '#7dd3fc', text: '#0369a1' },
];

function paletteForName(name) {
  let hash = 0;
  const str = String(name || '?');
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

export default function Avatar({ name, size = 'md' }) {
  const palette = paletteForName(name);

  return (
    <span
      className={`ats-avatar ats-avatar-${size}`}
      style={{
        background: palette.bg,
        borderColor: palette.border,
        color: palette.text,
      }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
