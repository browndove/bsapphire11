'use client';

export default function ApplyContactFields({
  firstName,
  lastName,
  email,
  phone,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  disabled = false,
  errors = {},
}) {
  return (
    <div className="ats-form-section">
      <div className="ats-form-section-head">
        <h3>Your details</h3>
        <p>We&apos;ll use this to contact you about your application.</p>
      </div>

      <div className="ats-form-grid cols-2">
        <div className="ats-field">
          <label className="ats-field-label" htmlFor="apply-first-name">First name</label>
          <input
            id="apply-first-name"
            required
            autoComplete="given-name"
            disabled={disabled}
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
          />
          {errors.first_name ? <p className="ats-field-error">{errors.first_name}</p> : null}
        </div>
        <div className="ats-field">
          <label className="ats-field-label" htmlFor="apply-last-name">Last name</label>
          <input
            id="apply-last-name"
            required
            autoComplete="family-name"
            disabled={disabled}
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
          />
          {errors.last_name ? <p className="ats-field-error">{errors.last_name}</p> : null}
        </div>
      </div>

      <div className="ats-form-grid cols-2">
        <div className="ats-field">
          <label className="ats-field-label" htmlFor="apply-email">Email</label>
          <input
            id="apply-email"
            type="email"
            required
            autoComplete="email"
            disabled={disabled}
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
          />
          {errors.email ? <p className="ats-field-error">{errors.email}</p> : null}
        </div>
        <div className="ats-field">
          <label className="ats-field-label" htmlFor="apply-phone">Phone</label>
          <input
            id="apply-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1234567890"
            disabled={disabled}
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
          />
          {errors.phone ? <p className="ats-field-error">{errors.phone}</p> : null}
        </div>
      </div>
    </div>
  );
}
