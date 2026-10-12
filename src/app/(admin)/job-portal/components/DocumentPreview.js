'use client';

import { useEffect, useState } from 'react';
import { createInlineFileUrl, openFileWithOriginalName } from '@/lib/job-api/client';
import { toUserMessage } from '@/lib/job-api/errors';

function previewKind(fileName = '') {
  const name = String(fileName || '').toLowerCase();
  if (/\.(png|jpe?g|gif|webp)$/.test(name)) return 'image';
  if (/\.pdf$/.test(name) || !name) return 'pdf';
  return 'file';
}

export default function DocumentPreview({ href, fileName, title = 'Resume' }) {
  const [src, setSrc] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const kind = previewKind(fileName);

  useEffect(() => {
    let cancelled = false;
    if (!href || kind === 'file') {
      setSrc('');
      return undefined;
    }
    setLoading(true);
    setError('');
    createInlineFileUrl(href, { filename: fileName })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch((err) => {
        if (!cancelled) setError(toUserMessage(err, 'download'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [href, fileName, kind]);

  const download = async () => {
    try {
      await openFileWithOriginalName(href, { filename: fileName, disposition: 'attachment' });
    } catch (err) {
      setError(toUserMessage(err, 'download'));
    }
  };

  if (!href) {
    return <div className="ats-empty-card">No resume uploaded.</div>;
  }

  return (
    <div className="ats-doc-preview">
      <div className="ats-doc-preview-bar">
        <div>
          <strong>{title}</strong>
          {fileName ? <span>{fileName}</span> : null}
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={download}>
          Download
        </button>
      </div>
      {loading ? <div className="ats-skeleton ats-doc-preview-frame" /> : null}
      {error ? <p className="ats-field-hint">{error}</p> : null}
      {!loading && src && kind === 'image' ? (
        <img className="ats-doc-preview-image" src={src} alt={fileName || title} />
      ) : null}
      {!loading && src && kind === 'pdf' ? (
        <iframe className="ats-doc-preview-frame" title={fileName || title} src={src} />
      ) : null}
      {!loading && kind === 'file' ? (
        <div className="ats-empty-card">
          This file type cannot be previewed here. Download it to open it.
        </div>
      ) : null}
    </div>
  );
}
