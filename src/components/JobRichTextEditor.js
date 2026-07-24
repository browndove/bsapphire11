'use client';

import { useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';

function ToolbarButton({ active, disabled, onClick, children, title }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active ? 'true' : 'false'}
      className={`ats-rte-btn${active ? ' is-active' : ''}`}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="ats-rte-divider" aria-hidden="true" />;
}

export default function JobRichTextEditor({
  id,
  value = '',
  onChange,
  placeholder = 'Write the role overview…',
  disabled = false,
  minHeight = '12rem',
}) {
  const lastEmitted = useRef(value);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        link: {
          openOnClick: false,
          HTMLAttributes: {
            rel: 'noopener noreferrer',
            target: '_blank',
          },
        },
      }),
      Placeholder.configure({ placeholder }),
      Markdown,
    ],
    content: value || '',
    contentType: 'markdown',
    editorProps: {
      attributes: {
        id: id || undefined,
        class: 'ats-rte-content ats-job-body ats-job-body--markdown',
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor: current }) => {
      const markdown = current.getMarkdown();
      lastEmitted.current = markdown;
      onChange?.(markdown);
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    if ((value || '') === (lastEmitted.current || '')) return;
    lastEmitted.current = value || '';
    editor.commands.setContent(value || '', { contentType: 'markdown' });
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="ats-rte" aria-busy="true">
        <div className="ats-rte-toolbar" />
        <div className="ats-rte-shell ats-rte-shell--loading" style={{ minHeight }} />
      </div>
    );
  }

  const setLink = () => {
    const previous = editor.getAttributes('link').href || '';
    const url = window.prompt('Link URL', previous);
    if (url === null) return;
    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  return (
    <div className={`ats-rte${disabled ? ' is-disabled' : ''}`}>
      <div className="ats-rte-toolbar" role="toolbar" aria-label="Formatting">
        <ToolbarButton
          title="Bold"
          active={editor.isActive('bold')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive('italic')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          title="Heading"
          active={editor.isActive('heading', { level: 2 })}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H
        </ToolbarButton>
        <ToolbarButton
          title="Subheading"
          active={editor.isActive('heading', { level: 3 })}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          title="Bullet list"
          active={editor.isActive('bulletList')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor.isActive('orderedList')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          title="Link"
          active={editor.isActive('link')}
          disabled={disabled}
          onClick={setLink}
        >
          Link
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          title="Undo"
          disabled={disabled || !editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          Undo
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          disabled={disabled || !editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          Redo
        </ToolbarButton>
      </div>
      <div className="ats-rte-shell">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
