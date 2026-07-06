'use client';

const FUNNEL_COLORS = [
  '#38bdf8',
  '#63b3ed',
  '#a78bfa',
  '#fbbf24',
  '#4ade80',
  '#f87171',
  '#666666',
];

export default function PipelineFunnel({ stages, labels }) {
  const total = stages.reduce((sum, s) => sum + s.count, 0) || 1;

  return (
    <div>
      <div className="ats-funnel">
        {stages.map((s, i) => (
          <div
            key={s.key}
            className="ats-funnel-segment"
            style={{
              width: `${Math.max((s.count / total) * 100, s.count > 0 ? 3 : 0)}%`,
              background: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
            }}
            title={`${labels[s.key] || s.key}: ${s.count}`}
          />
        ))}
      </div>
      <div className="ats-funnel-legend">
        {stages.map((s, i) => (
          <div key={s.key} className="ats-funnel-legend-item">
            <span className="ats-funnel-dot" style={{ background: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }} />
            <span>{labels[s.key] || s.key}</span>
            <strong style={{ color: 'var(--text-color)' }}>{s.count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
