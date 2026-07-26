'use client';

import { useState } from 'react';
import { openFileWithOriginalName } from '@/lib/job-api/client';
import {
  fileNameFromStorageKey,
  normalizeOptionalUrl,
  resolveApplicationDocuments,
  sanitizeDownloadFileName,
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

function resolveDisplayName(fileName, href, fallback = 'PDF or document on file') {
  return (
    sanitizeDownloadFileName(fileName || '', '') ||
    fileNameFromStorageKey(href) ||
    fallback
  );
}

export function FileCard({ title, subtitle, href, fileName, actionLabel }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const displayName = resolveDisplayName(fileName, href, subtitle || 'PDF or document on file');

  if (!href && !displayName) return null;

  const openFile = async () => {
    if (!href || busy) return;
    setError('');
    setBusy(true);
    try {
      await openFileWithOriginalName(href, {
        filename: displayName,
        disposition: 'inline',
      });
    } catch (err) {
      setError(toUserMessage(err, 'download'));
    } finally {
      setBusy(false);
    }
  };

  const downloadFile = async () => {
    if (!href || busy) return;
    setError('');
    setBusy(true);
    try {
      await openFileWithOriginalName(href, {
        filename: displayName,
        disposition: 'attachment',
      });
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
        <span>{displayName}</span>
        {error ? <p className="ats-field-error">{error}</p> : null}
      </div>
      {href ? (
        <div className="ats-file-card-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={openFile}
            disabled={busy}
          >
            {busy ? 'Opening…' : actionLabel || 'View'}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={downloadFile}
            disabled={busy}
          >
            Download
          </button>
        </div>
      ) : null}
    </div>
  );
}

function LinkRow({ label, href }) {
  const url = normalizeOptionalUrl(href);
  if (!url) return null;
  const display = url.replace(/^https?:\/\//i, '');
  return (
    <p className="ats-external-link-row">
      <span className="ats-table-sub ats-external-link-label">{label}</span>
      <a href={url} target="_blank" rel="noreferrer" className="ats-external-link">
        {display}
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
        fileName={fileNameFromStorageKey(docs.additionalDocumentUrl)}
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
          fileName={docs.coverLetterFileName}
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
