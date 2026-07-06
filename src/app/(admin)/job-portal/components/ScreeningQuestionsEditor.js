'use client';

import CustomSelect from '@/components/CustomSelect';
import { useConfirm } from '@/components/ConfirmProvider';

const ANSWER_TYPE_OPTIONS = [
  { value: 'single', label: 'Single choice' },
  { value: 'multi', label: 'Multiple choice' },
  { value: 'text', label: 'Short text' },
];

function newQuestionId() {
  return `sq_${Math.random().toString(36).slice(2, 10)}`;
}

const EMPTY_QUESTION = {
  id: '',
  label: '',
  type: 'single',
  filterable: false,
  options: [],
};

export default function ScreeningQuestionsEditor({ questions = [], onChange }) {
  const confirm = useConfirm();

  const updateQuestions = (next) => onChange(next);

  const addQuestion = () => {
    updateQuestions([...questions, { ...EMPTY_QUESTION, id: newQuestionId() }]);
  };

  const updateQuestion = (index, patch) => {
    updateQuestions(
      questions.map((q, i) => (i === index ? { ...q, ...patch } : q))
    );
  };

  const removeQuestion = async (index) => {
    const ok = await confirm({
      title: 'Remove question?',
      message: 'This question will be removed from the application form.',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    updateQuestions(questions.filter((_, i) => i !== index));
  };

  const addOption = (index) => {
    const options = questions[index]?.options || [];
    updateQuestion(index, { options: [...options, ''] });
  };

  const updateOption = (index, optionIndex, value) => {
    const options = [...(questions[index]?.options || [])];
    options[optionIndex] = value;
    updateQuestion(index, { options });
  };

  const removeOption = (index, optionIndex) => {
    const options = (questions[index]?.options || []).filter((_, i) => i !== optionIndex);
    updateQuestion(index, { options });
  };

  return (
    <div className="ats-form-section-head">
      <h3>Screening questionnaire</h3>
      <p>
        Questions appear on the public apply form. Choice questions can be used as recruiter filters.
      </p>

      <div className="ats-question-list" style={{ marginTop: '1rem' }}>
        {questions.length === 0 ? (
          <div className="ats-question-empty">
            No questions yet. Add one to collect structured answers from applicants.
          </div>
        ) : (
          questions.map((q, index) => (
            <div key={q.id || index} className="ats-question-card">
              <div className="ats-question-card-head">
                <strong>Question {index + 1}</strong>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => removeQuestion(index)}
                >
                  Remove
                </button>
              </div>

              <div className="ats-field">
                <label className="ats-field-label" htmlFor={`q-label-${index}`}>Question</label>
                <input
                  id={`q-label-${index}`}
                  type="text"
                  placeholder="e.g. Years of backend experience"
                  value={q.label}
                  onChange={(e) => updateQuestion(index, { label: e.target.value })}
                />
              </div>

              <div className="ats-form-grid cols-2" style={{ marginTop: '0.75rem' }}>
                <div className="ats-field">
                  <label className="ats-field-label" htmlFor={`q-type-${index}`}>Answer type</label>
                  <CustomSelect
                    id={`q-type-${index}`}
                    value={q.type}
                    onChange={(type) =>
                      updateQuestion(index, {
                        type,
                        filterable: type === 'text' ? false : q.filterable,
                      })
                    }
                    options={ANSWER_TYPE_OPTIONS}
                  />
                  {q.type === 'text' ? (
                    <p className="ats-field-hint">Text answers cannot be used as stage filters.</p>
                  ) : null}
                </div>

                <div className="ats-field" style={{ justifyContent: 'flex-end' }}>
                  <label className="ats-checkbox-row">
                    <input
                      type="checkbox"
                      checked={!!q.filterable}
                      disabled={q.type === 'text'}
                      onChange={(e) => updateQuestion(index, { filterable: e.target.checked })}
                    />
                    Use answers as recruiter filters
                  </label>
                </div>
              </div>

              {q.type !== 'text' ? (
                <div className="ats-field" style={{ marginTop: '0.75rem' }}>
                  <label className="ats-field-label">Options</label>
                  {(q.options || []).length === 0 ? (
                    <p className="ats-field-hint">No options yet. Add at least two choices.</p>
                  ) : (
                    <div className="ats-option-list">
                      {(q.options || []).map((opt, optionIndex) => (
                        <div className="ats-option-row" key={optionIndex}>
                          <span className="ats-option-index">{optionIndex + 1}</span>
                          <input
                            type="text"
                            className="ats-option-input"
                            placeholder={`Option ${optionIndex + 1}`}
                            value={opt}
                            onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                          />
                          <button
                            type="button"
                            className="ats-option-remove"
                            aria-label={`Remove option ${optionIndex + 1}`}
                            onClick={() => removeOption(index, optionIndex)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline btn-sm ats-option-add"
                    onClick={() => addOption(index)}
                  >
                    Add option
                  </button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        className="btn btn-outline btn-sm"
        style={{ marginTop: '0.85rem' }}
        onClick={addQuestion}
      >
        Add question
      </button>
    </div>
  );
}
