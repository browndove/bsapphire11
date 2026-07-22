'use client';

import {
  APPLICATION_FIELD_KEYS,
  APPLICATION_FIELD_LABELS,
  DEFAULT_APPLICATION_FIELDS,
  isApplicationFieldLocked,
  normalizeApplicationFields,
} from '@/lib/job-api/application-fields';

const REQUIREMENT_OPTIONS = [
  { value: 'required', label: 'Required' },
  { value: 'optional', label: 'Optional' },
  { value: 'hidden', label: 'Hidden' },
];

export default function ApplicationFieldsEditor({
  value = DEFAULT_APPLICATION_FIELDS,
  onChange,
  disabled = false,
}) {
  const fields = normalizeApplicationFields(value);

  const updateField = (key, requirement) => {
    if (disabled || isApplicationFieldLocked(key)) return;
    onChange(
      normalizeApplicationFields({
        ...fields,
        [key]: requirement,
      })
    );
  };

  return (
    <div className="ats-application-fields-editor">
      <div className="ats-panel-head" style={{ marginBottom: '0.5rem' }}>
        <h3 className="ats-panel-title" style={{ margin: 0 }}>What candidates must submit</h3>
      </div>
      <p className="ats-field-hint" style={{ marginTop: 0, marginBottom: '1.25rem' }}>
        Set each item to required, optional, or hidden on the public apply form. Resume is always required.
      </p>

      <div className="ats-application-fields-list">
        {APPLICATION_FIELD_KEYS.map((key) => {
          const locked = isApplicationFieldLocked(key);
          return (
            <div className="ats-application-field-row" key={key}>
              <div className="ats-application-field-label">
                {APPLICATION_FIELD_LABELS[key]}
                {locked ? <span className="ats-table-sub"> · always required</span> : null}
              </div>
              <div className="ats-requirement-toggle" role="group" aria-label={APPLICATION_FIELD_LABELS[key]}>
                {REQUIREMENT_OPTIONS.map((option) => {
                  const active = fields[key] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`ats-requirement-btn${active ? ' is-active' : ''}`}
                      aria-pressed={active}
                      disabled={disabled || locked}
                      onClick={() => updateField(key, option.value)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
