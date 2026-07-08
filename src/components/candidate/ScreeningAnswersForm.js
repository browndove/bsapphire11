'use client';

function fieldError(errors, questionId) {
  return errors?.[`answers.${questionId}`] || errors?.[questionId] || '';
}

export default function ScreeningAnswersForm({
  questions = [],
  values = {},
  onChange,
  errors = {},
  disabled = false,
}) {
  if (!questions.length) return null;

  const setValue = (questionId, value) => {
    onChange({ ...values, [questionId]: value });
  };

  const toggleMulti = (questionId, option) => {
    const current = Array.isArray(values[questionId]) ? values[questionId] : [];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setValue(questionId, next);
  };

  return (
    <div className="ats-screening-form">
      <h3 className="ats-panel-title" style={{ marginBottom: '0.25rem' }}>Screening questions</h3>
      <p className="ats-field-hint" style={{ marginBottom: '1rem' }}>
        All questions are required for this role.
      </p>

      {questions.map((q) => {
        const err = fieldError(errors, q.id);
        return (
          <div className="ats-field ats-screening-question" key={q.id}>
            <span className="ats-field-label">{q.label}</span>

            {q.type === 'text' ? (
              <textarea
                rows={4}
                required
                disabled={disabled}
                value={values[q.id] || ''}
                onChange={(e) => setValue(q.id, e.target.value)}
                placeholder="Your answer"
              />
            ) : q.type === 'multi' ? (
              <div className="ats-screening-options" role="group" aria-label={q.label}>
                {(q.options || []).map((opt) => {
                  const checked = Array.isArray(values[q.id]) && values[q.id].includes(opt);
                  return (
                    <label className={`ats-screening-option ${checked ? 'is-checked' : ''}`} key={opt}>
                      <input
                        type="checkbox"
                        disabled={disabled}
                        checked={checked}
                        onChange={() => toggleMulti(q.id, opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="ats-screening-options" role="radiogroup" aria-label={q.label}>
                {(q.options || []).map((opt) => {
                  const checked = values[q.id] === opt;
                  return (
                    <label className={`ats-screening-option ${checked ? 'is-checked' : ''}`} key={opt}>
                      <input
                        type="radio"
                        name={`screening-${q.id}`}
                        disabled={disabled}
                        checked={checked}
                        onChange={() => setValue(q.id, opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {err ? <p className="ats-field-error">{err}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
