'use client';

import Link from 'next/link';

export default function StickyFormBar({
  status,
  saving,
  deleting = false,
  onSave,
  onDelete,
  cancelHref,
  toast,
  error,
}) {
  return (
    <div className="ats-sticky-bar">
      <div>
        <span className="ats-status-pill">Status: {status || 'draft'}</span>
        {toast ? <span className="hint toast-success" style={{ marginLeft: '1rem' }}>{toast}</span> : null}
        {error ? <span className="login-error is-visible" style={{ marginLeft: '1rem', display: 'inline' }}>{error}</span> : null}
      </div>
      <div className="ats-sticky-bar-actions">
        {onDelete ? (
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={onDelete}
            disabled={saving || deleting}
          >
            {deleting ? 'Deleting…' : 'Delete job'}
          </button>
        ) : null}
        <Link href={cancelHref} className="btn btn-outline">Cancel</Link>
        <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving || deleting}>
          {saving ? 'Saving…' : 'Save job'}
        </button>
      </div>
    </div>
  );
}
