'use client';

export default function ViewToggle({ value, onChange }) {
  return (
    <div className="ats-view-toggle">
      <button
        type="button"
        className={value === 'board' ? 'is-active' : ''}
        onClick={() => onChange('board')}
      >
        Board
      </button>
      <button
        type="button"
        className={value === 'list' ? 'is-active' : ''}
        onClick={() => onChange('list')}
      >
        List
      </button>
    </div>
  );
}
