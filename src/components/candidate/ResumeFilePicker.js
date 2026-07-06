'use client';

import { useId, useRef, useState } from 'react';
import {
  formatResumeSize,
  isAllowedResume,
  RESUME_ACCEPT,
  RESUME_MAX_BYTES,
} from '@/lib/job-api/resume-upload';

function UploadIcon() {
  return (
    <svg className="ats-file-picker-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 16V4m0 0 4 4m-4-4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="ats-file-picker-file-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8l-6-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function ResumeFilePicker({
  value,
  onChange,
  error = '',
  disabled = false,
  id,
}) {
  const autoId = useId();
  const inputId = id || autoId;
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const pickFile = () => {
    if (!disabled) inputRef.current?.click();
  };

  const applyFile = (file) => {
    if (!file) {
      onChange(null, '');
      return;
    }
    if (!isAllowedResume(file)) {
      onChange(null, `Upload a PDF or Word file up to ${formatResumeSize(RESUME_MAX_BYTES)}.`);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    onChange(file, '');
  };

  const handleInputChange = (e) => {
    applyFile(e.target.files?.[0] || null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    applyFile(e.dataTransfer.files?.[0] || null);
  };

  const clearFile = (e) => {
    e.stopPropagation();
    if (inputRef.current) inputRef.current.value = '';
    onChange(null, '');
  };

  return (
    <div className="ats-file-picker">
      <input
        ref={inputRef}
        id={inputId}
        className="ats-file-picker-input"
        type="file"
        accept={RESUME_ACCEPT}
        disabled={disabled}
        onChange={handleInputChange}
      />

      {value ? (
        <div className="ats-file-picker-selected">
          <div className="ats-file-picker-selected-main">
            <FileIcon />
            <div className="ats-file-picker-selected-meta">
              <span className="ats-file-picker-filename">{value.name}</span>
              <span className="ats-file-picker-filesize">{formatResumeSize(value.size)}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={clearFile}
            disabled={disabled}
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={`ats-file-picker-zone ${dragging ? 'is-dragging' : ''}`}
          onClick={pickFile}
          onDragEnter={(e) => {
            e.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          disabled={disabled}
          aria-describedby={`${inputId}-hint`}
        >
          <UploadIcon />
          <span className="ats-file-picker-title">
            <span className="ats-file-picker-emphasis">Click to upload</span>
            {' '}or drag and drop
          </span>
          <span className="ats-file-picker-subtitle" id={`${inputId}-hint`}>
            PDF or Word up to {formatResumeSize(RESUME_MAX_BYTES)}
          </span>
        </button>
      )}

      {error ? <p className="ats-field-error">{error}</p> : null}
    </div>
  );
}
