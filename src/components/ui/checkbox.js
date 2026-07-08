'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

function CheckIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const Checkbox = React.forwardRef(({ className = '', ...props }, ref) => (
  <CheckboxPrimitive.Root ref={ref} className={`ui-checkbox ${className}`.trim()} {...props}>
    <CheckboxPrimitive.Indicator className="ui-checkbox-indicator">
      <CheckIcon className="ui-checkbox-icon" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
