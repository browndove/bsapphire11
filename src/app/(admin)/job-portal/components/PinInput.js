'use client';

import { useRef } from 'react';

export default function PinInput({ id = 'pin', value = '', onChange, length = 6, disabled = false }) {
  const refs = useRef([]);
  const digits = Array.from({ length }, (_, index) => value[index] || '');

  const commit = (nextDigits) => {
    onChange(nextDigits.join('').replace(/\D/g, '').slice(0, length));
  };

  const focusAt = (index) => {
    const node = refs.current[index];
    if (node) node.focus();
  };

  const handleChange = (index, raw) => {
    const chars = raw.replace(/\D/g, '');
    if (!chars) {
      const next = [...digits];
      next[index] = '';
      commit(next);
      return;
    }
    const next = [...digits];
    chars.split('').forEach((char, offset) => {
      if (index + offset < length) next[index + offset] = char;
    });
    commit(next);
    focusAt(Math.min(index + chars.length, length - 1));
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      focusAt(index - 1);
    }
    if (event.key === 'ArrowLeft' && index > 0) focusAt(index - 1);
    if (event.key === 'ArrowRight' && index < length - 1) focusAt(index + 1);
  };

  const handlePaste = (event) => {
    const text = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!text) return;
    event.preventDefault();
    const next = Array.from({ length }, (_, index) => text[index] || '');
    commit(next);
    focusAt(Math.min(text.length, length) - 1);
  };

  return (
    <div className="ats-pin" role="group" aria-labelledby={id}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          className="ats-pin-box"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
