'use client';

export default function ScreeningFilterChips({
  questions = [],
  selectedFilters = {},
  onChange,
}) {
  const filterable = questions.filter(
    (q) => q.type !== 'text' && (q.options || []).filter(Boolean).length
  );
  if (!filterable.length) return null;

  const toggle = (questionId, option) => {
    const current = selectedFilters[questionId] || [];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    const updated = { ...selectedFilters };
    if (next.length) {
      updated[questionId] = next;
    } else {
      delete updated[questionId];
    }
    onChange(updated);
  };

  return (
    <div className="ats-filter-section">
      <span className="ats-field-label">Screening answers</span>
      <div className="ats-screening-filters">
        {filterable.map((q) => (
          <div className="ats-screening-filter-group" key={q.id}>
            <p className="ats-screening-filter-label">{q.label}</p>
            <div className="ats-filter-chips">
              {(q.options || []).filter(Boolean).map((opt) => {
                const active = (selectedFilters[q.id] || []).includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    className={`ats-filter-chip ${active ? 'is-on' : ''}`}
                    onClick={() => toggle(q.id, opt)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
