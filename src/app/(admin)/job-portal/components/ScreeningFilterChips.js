'use client';

import CustomSelect from '@/components/CustomSelect';

function hasActiveNumeric(range) {
  if (!range) return false;
  return (
    (range.min !== '' && range.min != null) ||
    (range.max !== '' && range.max != null) ||
    (range.exact !== '' && range.exact != null)
  );
}

export default function ScreeningFilterChips({
  questions = [],
  selectedFilters = {},
  numericFilters = {},
  onChoiceFiltersChange,
  onNumericFiltersChange,
  sortBy = '',
  sortDir = 'desc',
  onSortChange,
}) {
  const choiceQuestions = questions.filter(
    (q) => (q.type === 'single' || q.type === 'multi') && (q.options || []).filter(Boolean).length
  );
  const numberQuestions = questions.filter((q) => q.type === 'number');
  const sortableNumbers = numberQuestions.filter((q) => q.filterable !== false);

  if (!choiceQuestions.length && !numberQuestions.length) return null;

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
    onChoiceFiltersChange?.(updated);
  };

  const setNumeric = (questionId, patch) => {
    const current = numericFilters[questionId] || { min: '', max: '' };
    const nextRange = { ...current, ...patch };
    const updated = { ...numericFilters };
    if (!hasActiveNumeric(nextRange)) {
      delete updated[questionId];
    } else {
      updated[questionId] = nextRange;
    }
    onNumericFiltersChange?.(updated);
  };

  const sortOptions = [
    { value: '', label: 'Default (newest)' },
    ...sortableNumbers.map((q) => ({
      value: q.id,
      label: q.label || q.id,
    })),
  ];

  return (
    <div className="ats-filter-section">
      <span className="ats-field-label">Screening answers</span>
      <div className="ats-screening-filters">
        {choiceQuestions.map((q) => (
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

        {numberQuestions.map((q) => {
          const range = numericFilters[q.id] || { min: '', max: '' };
          return (
            <div className="ats-screening-filter-group" key={q.id}>
              <p className="ats-screening-filter-label">{q.label}</p>
              <div className="ats-numeric-filter-row">
                <label className="ats-numeric-filter-field">
                  <span>Min</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={range.min ?? ''}
                    onChange={(e) => setNumeric(q.id, { min: e.target.value, exact: '' })}
                    placeholder="Any"
                  />
                </label>
                <label className="ats-numeric-filter-field">
                  <span>Max</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={range.max ?? ''}
                    onChange={(e) => setNumeric(q.id, { max: e.target.value, exact: '' })}
                    placeholder="Any"
                  />
                </label>
              </div>
            </div>
          );
        })}

        {sortableNumbers.length ? (
          <div className="ats-screening-filter-group">
            <p className="ats-screening-filter-label">Sort by number</p>
            <div className="ats-numeric-sort-row">
              <CustomSelect
                id="screening-sort-by"
                value={sortBy || ''}
                onChange={(value) => onSortChange?.({ sortBy: value, sortDir })}
                options={sortOptions}
              />
              {sortBy ? (
                <div className="ats-filter-chips">
                  <button
                    type="button"
                    className={`ats-filter-chip ${sortDir === 'desc' ? 'is-on' : ''}`}
                    onClick={() => onSortChange?.({ sortBy, sortDir: 'desc' })}
                  >
                    High → low
                  </button>
                  <button
                    type="button"
                    className={`ats-filter-chip ${sortDir === 'asc' ? 'is-on' : ''}`}
                    onClick={() => onSortChange?.({ sortBy, sortDir: 'asc' })}
                  >
                    Low → high
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
