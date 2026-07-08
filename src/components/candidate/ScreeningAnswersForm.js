'use client';

import { Checkbox } from '@/components/ui/checkbox';

function fieldError(errors, questionId) {
  return errors?.[`answers.${questionId}`] || errors?.[questionId] || '';
}

const TYPE_LABELS = {
  single: 'Single choice',
  multi: 'Multiple choice',
  text: 'Short text',
};

const TYPE_HINTS = {
  single: 'Select one option',
  multi: 'Select all that apply',
  text: 'Write your answer below',
};

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
    <section className="ats-screening-form" aria-labelledby="screening-form-title">
      <div className="ats-screening-form-head">
        <div>
          <h3 className="ats-panel-title" id="screening-form-title">
            Screening questions
          </h3>
          <p className="ats-screening-form-lead">
            Answer each question below. All responses are required for this role.
          </p>
        </div>
        <span className="ats-screening-count">
          {questions.length} {questions.length === 1 ? 'question' : 'questions'}
        </span>
      </div>

      <div className="ats-answer-list">
        {questions.map((q, index) => {
          const err = fieldError(errors, q.id);
          const typeLabel = TYPE_LABELS[q.type] || 'Question';
          const typeHint = TYPE_HINTS[q.type] || '';

          return (
            <article
              className={`ats-answer-card ${err ? 'has-error' : ''}`}
              key={q.id}
              aria-invalid={err ? 'true' : undefined}
            >
              <header className="ats-answer-card-head">
                <div className="ats-question-card-title">
                  <span className="ats-question-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <strong>{q.label}</strong>
                    <span>{typeLabel}</span>
                  </div>
                </div>
              </header>

              <div className="ats-answer-card-body">
                {typeHint ? <p className="ats-answer-hint">{typeHint}</p> : null}

                {q.type === 'text' ? (
                  <textarea
                    className="ats-answer-textarea"
                    rows={4}
                    required
                    disabled={disabled}
                    value={values[q.id] || ''}
                    onChange={(e) => setValue(q.id, e.target.value)}
                    placeholder="Type your answer here…"
                    aria-describedby={err ? `screening-error-${q.id}` : undefined}
                  />
                ) : q.type === 'multi' ? (
                  <div className="ats-answer-options" role="group" aria-label={q.label}>
                    {(q.options || []).map((opt) => {
                      const checked = Array.isArray(values[q.id]) && values[q.id].includes(opt);
                      return (
                        <label
                          className={`ats-answer-option ${checked ? 'is-selected' : ''}`}
                          key={opt}
                        >
                          <Checkbox
                            checked={checked}
                            disabled={disabled}
                            onCheckedChange={() => toggleMulti(q.id, opt)}
                          />
                          <span className="ats-answer-option-text">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="ats-answer-options" role="radiogroup" aria-label={q.label}>
                    {(q.options || []).map((opt) => {
                      const checked = values[q.id] === opt;
                      return (
                        <label
                          className={`ats-answer-option ${checked ? 'is-selected' : ''}`}
                          key={opt}
                        >
                          <input
                            type="radio"
                            className="ats-answer-input-sr"
                            name={`screening-${q.id}`}
                            disabled={disabled}
                            checked={checked}
                            onChange={() => setValue(q.id, opt)}
                          />
                          <span className="ats-answer-radio" aria-hidden="true">
                            <span className="ats-answer-radio-dot" />
                          </span>
                          <span className="ats-answer-option-text">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {err ? (
                  <p className="ats-field-error ats-answer-error" id={`screening-error-${q.id}`}>
                    {err}
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
