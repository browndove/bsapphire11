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

export default function CoverLetterMaterials({ coverLetter = '' }) {
  const { text, fileUrl, fileName } = parseCoverLetterMaterials(coverLetter);

  if (!text && !fileUrl) {
    return <div className="ats-empty-card">No cover letter provided.</div>;
  }

  return (
    <div className="ats-cover-letter-materials">
      {fileUrl ? (
        <div className="ats-file-card" style={{ marginBottom: text ? '0.75rem' : 0 }}>
          <div className="ats-file-card-icon" aria-hidden="true">
            <FileIcon />
          </div>
          <div className="ats-file-card-body">
            <strong>Cover letter attached</strong>
            <span>{fileName || 'PDF or document on file'}</span>
          </div>
          <a href={fileUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
            View cover letter
          </a>
        </div>
      ) : null}
      {text ? <blockquote className="ats-prose-block">{text}</blockquote> : null}
    </div>
  );
}
