'use client';

import CustomSelect from '@/components/CustomSelect';
import { Checkbox } from '@/components/ui/checkbox';
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
  filterable: true,
  options: ['', ''],
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

  const handleTypeChange = (index, type) => {
    const current = questions[index];
    const options =
      type === 'text'
        ? []
        : (current?.options || []).length >= 2
          ? current.options
          : ['', ''];
    updateQuestion(index, {
      type,
      filterable: type === 'text' ? false : true,
      options,
    });
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
    <div className="ats-screening-editor">
      <div className="ats-screening-editor-head">
        <div>
          <h3>Screening questionnaire</h3>
          <p>Questions appear on the apply form. Choice answers can power recruiter filters.</p>
        </div>
        {questions.length ? (
          <span className="ats-screening-count">{questions.length} question{questions.length === 1 ? '' : 's'}</span>
        ) : null}
      </div>

      <div className="ats-question-list">
        {questions.length === 0 ? (
          <div className="ats-question-empty">
            <strong>No screening questions yet</strong>
            <span>Add structured questions to learn more about applicants before review.</span>
          </div>
        ) : (
          questions.map((q, index) => (
            <article key={q.id || index} className="ats-question-card">
              <header className="ats-question-card-head">
                <div className="ats-question-card-title">
                  <span className="ats-question-number">{index + 1}</span>
                  <div>
                    <strong>Question {index + 1}</strong>
                    <span>{q.type === 'text' ? 'Short text' : q.type === 'multi' ? 'Multiple choice' : 'Single choice'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="ats-question-remove"
                  onClick={() => removeQuestion(index)}
                >
                  Remove
                </button>
              </header>

              <div className="ats-question-body">
                <div className="ats-field">
                  <label className="ats-field-label" htmlFor={`q-label-${index}`}>Question text</label>
                  <input
                    id={`q-label-${index}`}
                    type="text"
                    placeholder="e.g. How many years of backend experience do you have?"
                    value={q.label}
                    onChange={(e) => updateQuestion(index, { label: e.target.value })}
                  />
                </div>

                <div className="ats-question-settings">
                  <div className="ats-field">
                    <label className="ats-field-label" htmlFor={`q-type-${index}`}>Answer type</label>
                    <CustomSelect
                      id={`q-type-${index}`}
                      value={q.type}
                      onChange={(type) => handleTypeChange(index, type)}
                      options={ANSWER_TYPE_OPTIONS}
                    />
                  </div>

                  {q.type !== 'text' ? (
                    <div className={`ats-filter-toggle${q.filterable ? ' is-on' : ''}`}>
                      <Checkbox
                        checked={!!q.filterable}
                        onCheckedChange={(checked) => updateQuestion(index, { filterable: checked === true })}
                      />
                      <span className="ats-filter-toggle-copy">
                        <strong>Recruiter filter</strong>
                        <span>Let hiring teams filter candidates by this answer</span>
                      </span>
                    </div>
                  ) : (
                    <div className="ats-filter-toggle is-disabled">
                      <Checkbox disabled checked={false} />
                      <span className="ats-filter-toggle-copy">
                        <strong>Recruiter filter</strong>
                        <span>Not available for short text answers</span>
                      </span>
                    </div>
                  )}
                </div>

                {q.type !== 'text' ? (
                  <div className="ats-options-panel">
                    <div className="ats-options-panel-head">
                      <span className="ats-field-label">Answer options</span>
                      <span className="ats-options-panel-hint">Add at least two choices</span>
                    </div>

                    {(q.options || []).length === 0 ? (
                      <p className="ats-field-hint">No options yet.</p>
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
                              disabled={(q.options || []).length <= 2}
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
            </article>
          ))
        )}
      </div>

      <button
        type="button"
        className="btn btn-outline ats-add-question-btn"
        onClick={addQuestion}
      >
        Add question
      </button>
    </div>
  );
}
