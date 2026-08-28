'use client';

import ReactMarkdown from 'react-markdown';

const ALIGNMENT_PATTERN = /^<!--\s*job-align:(left|center|right|justify)\s*-->$/i;

function remarkJobAlignment() {
  return (tree) => {
    const visit = (parent) => {
      if (!Array.isArray(parent?.children)) return;

      for (let index = 0; index < parent.children.length - 1; index += 1) {
        const marker = parent.children[index];
        const match = marker?.type === 'html'
          ? String(marker.value || '').trim().match(ALIGNMENT_PATTERN)
          : null;
        if (!match) continue;

        const target = parent.children[index + 1];
        if (target && ['paragraph', 'heading'].includes(target.type)) {
          target.data = {
            ...(target.data || {}),
            hProperties: {
              ...(target.data?.hProperties || {}),
              className: `ats-job-align ats-job-align--${match[1].toLowerCase()}`,
            },
          };
          parent.children.splice(index, 1);
          index -= 1;
        }
      }

      parent.children.forEach(visit);
    };

    visit(tree);
  };
}

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
        remarkPlugins={[remarkJobAlignment]}
        components={{
          a: externalLinkProps,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
