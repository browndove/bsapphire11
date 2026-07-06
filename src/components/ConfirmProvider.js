'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ConfirmContext = createContext(null);

const EMPTY = {
  open: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'default',
  resolve: null,
};

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(EMPTY);

  const confirm = useCallback(
    ({
      title,
      message,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      variant = 'default',
    }) =>
      new Promise((resolve) => {
        setState({
          open: true,
          title,
          message: message || '',
          confirmText,
          cancelText,
          variant,
          resolve,
        });
      }),
    []
  );

  const close = useCallback((result) => {
    setState((prev) => {
      prev.resolve?.(result);
      return EMPTY;
    });
  }, []);

  useEffect(() => {
    if (!state.open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') close(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [state.open, close]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {state.open ? (
        <div className="confirm-overlay" role="presentation" onClick={() => close(false)}>
          <div
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby={state.message ? 'confirm-dialog-message' : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-dialog-title" className="confirm-dialog-title">{state.title}</h2>
            {state.message ? (
              <p id="confirm-dialog-message" className="confirm-dialog-message">{state.message}</p>
            ) : null}
            <div className="confirm-dialog-actions">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => close(false)}>
                {state.cancelText}
              </button>
              <button
                type="button"
                className={`btn btn-sm ${state.variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => close(true)}
              >
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return ctx.confirm;
}
