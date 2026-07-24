'use client';

import ReactMarkdown from 'react-markdown';

function externalLinkProps(props) {
  const { href, children, ...rest } = props;
  const isExternal = /^https?:\/\//i.test(String(href || ''));
  return (
    <a
      href={href}
      {...rest}
      {...(isExternal ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
    >
      {children}
    </a>
  );
}

/**
 * Renders job description / requirements.
 * Markdown is safe (no raw HTML). Plain format preserves whitespace.
 */
export default function JobBody({ text = '', format = 'markdown', className = '' }) {
  const content = String(text || '');
  if (!content.trim()) return null;

  const classes = ['ats-job-body', className].filter(Boolean).join(' ');

  if (format === 'plain') {
    return <div className={`${classes} ats-job-body--plain`}>{content}</div>;
  }

  return (
    <div className={`${classes} ats-job-body--markdown`}>
      <ReactMarkdown
        components={{
          a: externalLinkProps,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
