'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { Markdown } from '@tiptap/markdown';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ClipboardPaste,
  Code2,
  Copy,
  Eraser,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListOrdered,
  Paintbrush,
  Quote,
  Redo2,
  Scissors,
  Strikethrough,
  Subscript,
  Superscript,
  Undo2,
} from 'lucide-react';

function ToolbarButton({ active, disabled, onClick, children, icon: Icon, title }) {
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
      {Icon ? <Icon size={15} strokeWidth={2} /> : children}
    </button>
  );
}

function ToolbarGroup({ children, className = '', label }) {
  return (
    <span className={`ats-rte-group${className ? ` ${className}` : ''}`}>
      <span className="ats-rte-group-controls">{children}</span>
      {label ? <span className="ats-rte-group-label">{label}</span> : null}
    </span>
  );
}

function ToolbarStyleButton({ active, disabled, onClick, children, title }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active ? 'true' : 'false'}
      className={`ats-rte-style-tile${active ? ' is-active' : ''}`}
      disabled={disabled}
      onMouseDown={(event) => {
        event.preventDefault();
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

function ContextMenuButton({ children, onAction }) {
  return (
    <button
      type="button"
      className="ats-rte-context-item"
      role="menuitem"
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onAction?.();
      }}
    >
      {children}
    </button>
  );
}

function ToolbarSelect({ value, disabled, onChange, children, title }) {
  return (
    <select
      className="ats-rte-select"
      value={value}
      disabled={disabled}
      title={title}
      aria-label={title}
      onChange={(event) => onChange?.(event.target.value)}
    >
      {children}
    </select>
  );
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
  const contextSelection = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        code: true,
        codeBlock: false,
        link: {
          openOnClick: false,
          HTMLAttributes: {
            rel: 'noopener noreferrer',
            target: '_blank',
          },
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
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

  useEffect(() => {
    if (!contextMenu) return undefined;

    const close = () => setContextMenu(null);
    document.addEventListener('mousedown', close);
    document.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [contextMenu]);

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

  const textStyle = editor.isActive('heading')
    ? `heading-${editor.getAttributes('heading').level}`
    : 'paragraph';

  const applyTextStyle = (style) => {
    const chain = editor.chain().focus();
    if (style === 'paragraph') chain.setParagraph();
    else chain.setHeading({ level: Number(style.replace('heading-', '')) });
    chain.run();
  };

  const selectedText = () => {
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, '\n');
  };

  const copySelection = async () => {
    const text = selectedText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard permissions are optional; the browser menu remains available.
    }
  };

  const cutSelection = async () => {
    await copySelection();
    editor.chain().focus().deleteSelection().run();
  };

  const pasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) editor.chain().focus().insertContent(text).run();
    } catch {
      // Clipboard permissions are optional; use the native paste shortcut instead.
    }
  };

  const handleContextMenu = (event) => {
    if (disabled || editor.state.selection.empty) return;
    event.preventDefault();
    contextSelection.current = {
      from: editor.state.selection.from,
      to: editor.state.selection.to,
    };
    setContextMenu({
      left: Math.max(8, Math.min(event.clientX, window.innerWidth - 210)),
      top: Math.max(8, Math.min(event.clientY, window.innerHeight - 270)),
    });
  };

  const runContextAction = (action) => {
    if (contextSelection.current) {
      editor.chain().setTextSelection(contextSelection.current).focus().run();
    }
    action();
    setContextMenu(null);
  };

  return (
    <div className={`ats-rte${disabled ? ' is-disabled' : ''}`}>
      <div className="ats-rte-toolbar" role="toolbar" aria-label="Formatting">
        <ToolbarGroup label="Clipboard">
          <ToolbarButton icon={ClipboardPaste} title="Paste" disabled={disabled} onClick={pasteText} />
          <ToolbarButton icon={Scissors} title="Cut" disabled={disabled} onClick={cutSelection} />
          <ToolbarButton icon={Copy} title="Copy" disabled={disabled} onClick={copySelection} />
        </ToolbarGroup>
        <ToolbarGroup label="Font">
          <ToolbarSelect
            title="Text style"
            value={textStyle}
            disabled={disabled}
            onChange={applyTextStyle}
          >
            <option value="paragraph">Normal</option>
            <option value="heading-1">Heading 1</option>
            <option value="heading-2">Heading 2</option>
            <option value="heading-3">Heading 3</option>
          </ToolbarSelect>
          <ToolbarButton
            icon={Bold}
            title="Bold"
            active={editor.isActive('bold')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            icon={Italic}
            title="Italic"
            active={editor.isActive('italic')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            icon={Strikethrough}
            title="Strikethrough"
            active={editor.isActive('strike')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
          <ToolbarButton
            icon={Code2}
            title="Inline code"
            active={editor.isActive('code')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleCode().run()}
          />
          <ToolbarButton
            icon={Eraser}
            title="Clear formatting"
            disabled={disabled}
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          />
        </ToolbarGroup>
        <ToolbarGroup label="Paragraph">
          <ToolbarButton
            icon={List}
            title="Bullets"
            active={editor.isActive('bulletList')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            icon={ListOrdered}
            title="Numbering"
            active={editor.isActive('orderedList')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            icon={IndentDecrease}
            title="Decrease indent"
            disabled={disabled || !editor.can().liftListItem('listItem')}
            onClick={() => editor.chain().focus().liftListItem('listItem').run()}
          />
          <ToolbarButton
            icon={IndentIncrease}
            title="Increase indent"
            disabled={disabled || !editor.can().sinkListItem('listItem')}
            onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
          />
          <ToolbarButton
            icon={Quote}
            title="Quote"
            active={editor.isActive('blockquote')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
          <ToolbarButton
            icon={AlignLeft}
            title="Align left"
            active={editor.isActive({ textAlign: 'left' })}
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          />
          <ToolbarButton
            icon={AlignCenter}
            title="Align center"
            active={editor.isActive({ textAlign: 'center' })}
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          />
          <ToolbarButton
            icon={AlignRight}
            title="Align right"
            active={editor.isActive({ textAlign: 'right' })}
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          />
          <ToolbarButton
            icon={AlignJustify}
            title="Justify"
            active={editor.isActive({ textAlign: 'justify' })}
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          />
        </ToolbarGroup>
        <ToolbarGroup label="Insert">
          <ToolbarButton
            icon={Link2}
            title="Insert link"
            active={editor.isActive('link')}
            disabled={disabled}
            onClick={setLink}
          />
          <ToolbarButton
            icon={Paintbrush}
            title="Insert horizontal rule"
            disabled={disabled}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          />
        </ToolbarGroup>
        <ToolbarGroup label="Styles">
          <ToolbarStyleButton
            title="Normal"
            active={textStyle === 'paragraph'}
            disabled={disabled}
            onClick={() => applyTextStyle('paragraph')}
          >
            Normal
          </ToolbarStyleButton>
          <ToolbarStyleButton
            title="Heading 1"
            active={textStyle === 'heading-1'}
            disabled={disabled}
            onClick={() => applyTextStyle('heading-1')}
          >
            Heading 1
          </ToolbarStyleButton>
          <ToolbarStyleButton
            title="Heading 2"
            active={textStyle === 'heading-2'}
            disabled={disabled}
            onClick={() => applyTextStyle('heading-2')}
          >
            Heading 2
          </ToolbarStyleButton>
          <ToolbarStyleButton
            title="Quote"
            active={editor.isActive('blockquote')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            Quote
          </ToolbarStyleButton>
        </ToolbarGroup>
        <ToolbarGroup label="Editing" className="ats-rte-group--history">
          <ToolbarButton
            icon={Undo2}
            title="Undo"
            disabled={disabled || !editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          />
          <ToolbarButton
            icon={Redo2}
            title="Redo"
            disabled={disabled || !editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          />
        </ToolbarGroup>
      </div>
      <div className="ats-rte-shell" onContextMenu={handleContextMenu}>
        <EditorContent editor={editor} />
        {contextMenu ? (
          <div
            className="ats-rte-context-menu"
            role="menu"
            aria-label="Text formatting"
            style={{ left: contextMenu.left, top: contextMenu.top }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ContextMenuButton onAction={() => runContextAction(() => editor.chain().focus().toggleBold().run())}>
              <strong>Bold</strong>
            </ContextMenuButton>
            <ContextMenuButton onAction={() => runContextAction(() => editor.chain().focus().toggleItalic().run())}>
              <em>Italic</em>
            </ContextMenuButton>
            <ContextMenuButton onAction={() => runContextAction(() => editor.chain().focus().toggleStrike().run())}>
              <s>Strikethrough</s>
            </ContextMenuButton>
            <span className="ats-rte-context-divider" aria-hidden="true" />
            <ContextMenuButton onAction={() => runContextAction(() => editor.chain().focus().toggleBulletList().run())}>
              • Bullet list
            </ContextMenuButton>
            <ContextMenuButton onAction={() => runContextAction(() => editor.chain().focus().toggleOrderedList().run())}>
              1. Numbered list
            </ContextMenuButton>
            <ContextMenuButton onAction={() => runContextAction(() => editor.chain().focus().toggleBlockquote().run())}>
              ❝ Quote
            </ContextMenuButton>
            <ContextMenuButton onAction={() => runContextAction(() => editor.chain().focus().setTextAlign('left').run())}>
              Align left
            </ContextMenuButton>
            <ContextMenuButton onAction={() => runContextAction(() => editor.chain().focus().setTextAlign('center').run())}>
              Align center
            </ContextMenuButton>
            <ContextMenuButton onAction={() => runContextAction(() => editor.chain().focus().setTextAlign('right').run())}>
              Align right
            </ContextMenuButton>
            <ContextMenuButton onAction={() => runContextAction(() => editor.chain().focus().setTextAlign('justify').run())}>
              Justify
            </ContextMenuButton>
            <span className="ats-rte-context-divider" aria-hidden="true" />
            <ContextMenuButton onAction={() => runContextAction(() => editor.chain().focus().unsetAllMarks().clearNodes().run())}>
              Clear formatting
            </ContextMenuButton>
            <ContextMenuButton onAction={() => runContextAction(() => editor.chain().focus().undo().run())}>
              Undo
            </ContextMenuButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}
