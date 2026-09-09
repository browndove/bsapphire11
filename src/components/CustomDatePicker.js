'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  formatInterviewDateLabel,
  minSelectableDateValue,
  parseDateValue,
  toDateValue,
} from '@/lib/job-api/interview-slot';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function IconChevron({ className, direction = 'down' }) {
  const rotation = { down: 0, left: 90, right: -90 }[direction] || 0;
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendar({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2.25" y="3.25" width="11.5" height="10.5" rx="1.5" />
      <path d="M2.25 6.75h11.5M5.25 2.25v2.5M10.75 2.25v2.5" strokeLinecap="round" />
    </svg>
  );
}

function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function buildCalendarDays(viewDate) {
  const first = monthStart(viewDate);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push({
      value: toDateValue(date),
      label: String(date.getDate()),
      inMonth: date.getMonth() === viewDate.getMonth(),
    });
  }
  return days;
}

export default function CustomDatePicker({
  id,
  name,
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  className = '',
  minDate,
}) {
  const autoId = useId();
  const selectId = id || autoId;
  const calendarId = `${selectId}-calendar`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const minValue = minDate || minSelectableDateValue();
  const selectedDate = parseDateValue(value);
  const displayLabel = selectedDate ? formatInterviewDateLabel(value) : placeholder;
  const [viewDate, setViewDate] = useState(() => monthStart(selectedDate || new Date()));

  useEffect(() => {
    if (!open) return;
    setViewDate(monthStart(parseDateValue(value) || parseDateValue(minValue) || new Date()));
  }, [open, value, minValue]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const todayValue = toDateValue(new Date());
  const minMonth = monthStart(parseDateValue(minValue) || new Date());
  const maxMonth = monthStart(shiftMonth(minMonth, 24));
  const canPrev = viewDate.getTime() > minMonth.getTime();
  const canNext = viewDate.getTime() < maxMonth.getTime();
  const monthLabel = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const pick = (nextValue, isDisabled) => {
    if (isDisabled) return;
    onChange?.(nextValue);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`custom-date ${open ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''} ${className}`.trim()}
    >
      {name ? <input type="hidden" name={name} value={value || ''} /> : null}
      <button
        type="button"
        id={selectId}
        className={`custom-date-trigger ${selectedDate ? '' : 'is-placeholder'}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={calendarId}
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <span className="custom-date-value">{displayLabel}</span>
        <IconCalendar className="custom-date-icon" />
      </button>

      {open ? (
        <div id={calendarId} className="custom-date-panel" role="dialog" aria-label="Choose a date">
          <div className="custom-date-head">
            <button
              type="button"
              className="custom-date-nav"
              aria-label="Previous month"
              disabled={!canPrev}
              onClick={() => canPrev && setViewDate((current) => shiftMonth(current, -1))}
            >
              <IconChevron direction="left" />
            </button>
            <div className="custom-date-month">{monthLabel}</div>
            <button
              type="button"
              className="custom-date-nav"
              aria-label="Next month"
              disabled={!canNext}
              onClick={() => canNext && setViewDate((current) => shiftMonth(current, 1))}
            >
              <IconChevron direction="right" />
            </button>
          </div>

          <div className="custom-date-weekdays" aria-hidden="true">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="custom-date-grid">
            {days.map((day) => {
              const isDisabled = day.value < minValue;
              const isSelected = day.value === value;
              const isToday = day.value === todayValue;
              return (
                <button
                  key={day.value}
                  type="button"
                  disabled={isDisabled}
                  className={[
                    'custom-date-day',
                    day.inMonth ? '' : 'is-outside',
                    isSelected ? 'is-selected' : '',
                    isToday ? 'is-today' : '',
                    isDisabled ? 'is-disabled' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => pick(day.value, isDisabled)}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
