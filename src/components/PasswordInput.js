'use client';

import { useState } from 'react';

export default function PasswordInput({
  id,
  name = 'password',
  value,
  onChange,
  required = false,
  autoComplete = 'current-password',
  disabled = false,
  placeholder,
  className = '',
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`password-input ${className}`.trim()}>
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        className="password-input-toggle"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        tabIndex={0}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
