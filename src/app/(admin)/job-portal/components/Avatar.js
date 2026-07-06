'use client';

import { getInitials } from '@/lib/job-api/format';

const PALETTES = [
  ['#0f2744', '#38bdf8'],
  ['#2d1b4e', '#a78bfa'],
  ['#1a3a2a', '#4ade80'],
  ['#3d2a14', '#fbbf24'],
  ['#3d1f1f', '#f87171'],
  ['#1e293b', '#94a3b8'],
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
  const [bg, accent] = paletteForName(name);

  return (
    <span
      className={`ats-avatar ats-avatar-${size}`}
      style={{
        background: `linear-gradient(135deg, ${bg} 0%, ${accent}22 100%)`,
        borderColor: `${accent}44`,
        color: accent,
      }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
