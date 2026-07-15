'use client';

import { parseCoverLetterMaterials } from '@/lib/job-api/cover-letter';

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M14 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8l-6-6Z" strokeLinejoin="round" />
      <path d="M14 2v6h6" strokeLinejoin="round" />
    </svg>
  );
}

function FileCard({ title, subtitle, href, actionLabel }) {
  if (!href) return null;
  return (
    <div className="ats-file-card">
      <div className="ats-file-card-icon" aria-hidden="true">
        <FileIcon />
      </div>
      <div className="ats-file-card-body">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <a href={href} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
        {actionLabel}
      </a>
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
}) {
  const parsed = parseCoverLetterMaterials(coverLetter);
  const documentUrl = additionalDocumentUrl || parsed.fileUrl;
  const documentName = parsed.fileName || 'PDF or document on file';
  const stubText = /^see attached cover letter\.?$/i.test(parsed.text);
  // Upload-only policy: only show legacy typed text when no file exists
  const legacyText = !documentUrl && parsed.text && !stubText ? parsed.text : '';

  const hasLinks = Boolean(githubUrl || additionalLink);

  if (!documentUrl && !legacyText && !hasLinks) {
    return <div className="ats-empty-card">No cover letter uploaded.</div>;
  }

  return (
    <div className="ats-cover-letter-materials">
      {documentUrl ? (
        <FileCard
          title="Cover letter attached"
          subtitle={documentName}
          href={documentUrl}
          actionLabel="View cover letter"
        />
      ) : null}
      {legacyText ? (
        <blockquote className="ats-prose-block" style={{ marginTop: 0 }}>
          {legacyText}
        </blockquote>
      ) : null}
      {hasLinks ? (
        <div style={{ marginTop: documentUrl || legacyText ? '0.75rem' : 0 }}>
          <LinkRow label="GitHub" href={githubUrl} />
          <LinkRow label="Link" href={additionalLink} />
        </div>
      ) : null}
    </div>
  );
}
