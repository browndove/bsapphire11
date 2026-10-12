'use client';

const COLORS = ['#38bdf8', '#63b3ed', '#a78bfa', '#fbbf24', '#f87171', '#4ade80'];

export default function PipelineFunnel({ stages, labels, onStageClick }) {
  const total = stages.reduce((sum, stage) => sum + stage.count, 0) || 1;

  return (
    <div className="ats-pipeline">
      <div className="ats-pipeline-bar" role="img" aria-label="Pipeline distribution">
        {stages.map((stage, index) =>
          stage.count > 0 ? (
            <button
              key={stage.key}
              type="button"
              className="ats-pipeline-seg"
              style={{
                flexGrow: stage.count,
                background: COLORS[index % COLORS.length],
              }}
              aria-label={`${labels[stage.key] || stage.key} ${stage.count}`}
              title={`${labels[stage.key] || stage.key} ${stage.count} (${Math.round((stage.count / total) * 100)}%)`}
              onClick={() => onStageClick?.(stage.key)}
            />
          ) : null
        )}
      </div>
      <ul className="ats-pipeline-legend">
        {stages.map((stage, index) => (
          <li key={stage.key}>
            <button type="button" onClick={() => onStageClick?.(stage.key)}>
              <span
                className="ats-pipeline-swatch"
                style={{ background: COLORS[index % COLORS.length] }}
              />
              <span>
                {labels[stage.key] || stage.key} {stage.count}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
