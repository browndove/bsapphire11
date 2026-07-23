'use client';

import { useState } from 'react';
import { resolveFileDownloadUrl } from '@/lib/job-api/client';
import {
  isBrowsableFileUrl,
  resolveApplicationDocuments,
} from '@/lib/job-api/cover-letter';
import { toUserMessage } from '@/lib/job-api/errors';

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M14 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8l-6-6Z" strokeLinejoin="round" />
      <path d="M14 2v6h6" strokeLinejoin="round" />
    </svg>
  );
}

export function FileCard({ title, subtitle, href, actionLabel }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!href && !subtitle) return null;

  const openFile = async () => {
    if (!href || busy) return;
    setError('');
    setBusy(true);
    try {
      const url = isBrowsableFileUrl(href) ? href : await resolveFileDownloadUrl(href);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(toUserMessage(err, 'download'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ats-file-card">
      <div className="ats-file-card-icon" aria-hidden="true">
        <FileIcon />
      </div>
      <div className="ats-file-card-body">
        <strong>{title}</strong>
        <span>{subtitle}</span>
        {error ? <p className="ats-field-error">{error}</p> : null}
      </div>
      {href ? (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={openFile}
          disabled={busy}
        >
          {busy ? 'Opening…' : actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function LinkRow({ label, href }) {
  if (!href) return null;
  return (
    <p style={{ margin: '0 0 0.5rem', wordBreak: 'break-all' }}>
      <span className="ats-table-sub" style={{ display: 'inline-block', minWidth: '5.5rem' }}>
        {label}
      </span>{' '}
      <a href={href} target="_blank" rel="noreferrer">
        {href}
      </a>
    </p>
  );
}

export default function CoverLetterMaterials({
  coverLetter = '',
  additionalDocumentUrl = '',
  githubUrl = '',
  additionalLink = '',
  mode = 'cover', // 'cover' | 'links' | 'additional'
}) {
  if (mode === 'links') {
    if (!githubUrl && !additionalLink) {
      return null;
    }
    return (
      <div className="ats-cover-letter-materials">
        <LinkRow label="GitHub" href={githubUrl} />
        <LinkRow label="Link" href={additionalLink} />
      </div>
    );
  }

  const docs = resolveApplicationDocuments({ coverLetter, additionalDocumentUrl });

  if (mode === 'additional') {
    if (!docs.additionalDocumentUrl) {
      return <div className="ats-empty-card">No additional document uploaded.</div>;
    }
    return (
      <FileCard
        title="Additional document attached"
        subtitle="PDF or document on file"
        href={docs.additionalDocumentUrl}
        actionLabel="View document"
      />
    );
  }

  if (!docs.coverLetterUrl && !docs.coverLetterText) {
    return <div className="ats-empty-card">No cover letter uploaded.</div>;
  }

  return (
    <div className="ats-cover-letter-materials">
      {docs.coverLetterUrl ? (
        <FileCard
          title="Cover letter attached"
          subtitle={docs.coverLetterFileName}
          href={docs.coverLetterUrl}
          actionLabel="View cover letter"
        />
      ) : null}
      {docs.coverLetterText ? (
        <blockquote className="ats-prose-block" style={{ marginTop: docs.coverLetterUrl ? '0.75rem' : 0 }}>
          {docs.coverLetterText}
        </blockquote>
      ) : null}
    </div>
  );
}
