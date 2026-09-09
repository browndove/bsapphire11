import {
  datetimeLocalToIso,
  extractLabeledValue,
  toDatetimeLocalValue,
} from './email-templates';

export const INTERVIEW_FORMAT_OPTIONS = [
  { value: 'Video call', label: 'Video call' },
  { value: 'In person', label: 'In person' },
];

export const INTERVIEW_SLOT_PLACEHOLDERS = {
  datetime: 'Select date & time',
  format: 'Select format',
  location: 'Select location',
  meetingLink: 'Add meeting link',
  address: 'Add address',
};

const STOCK_LOCATION_VALUES = [
  'add details',
  'same as invitation',
  'meeting link will be shared before the interview',
  'select location',
  'add meeting link',
  'add address',
];

function pad2(n) {
  return String(n).padStart(2, '0');
}

export function snapMinute(minute) {
  const n = Number(minute);
  if (Number.isNaN(n)) return '00';
  return pad2(Math.min(55, Math.floor(n / 5) * 5));
}

export function interviewSlotToLocal(dateValue, hour, minute) {
  if (!dateValue || hour === '' || hour == null || minute === '' || minute == null) {
    return '';
  }
  return `${dateValue}T${pad2(hour)}:${pad2(minute)}`;
}

export function interviewSlotToIso(dateValue, hour, minute) {
  return datetimeLocalToIso(interviewSlotToLocal(dateValue, hour, minute));
}

export function isoToInterviewSlot(iso) {
  const local = toDatetimeLocalValue(iso);
  if (!local) return { date: '', hour: '', minute: '' };
  const [date, time] = local.split('T');
  const [hour, minute] = (time || '').split(':');
  return { date: date || '', hour: hour || '', minute: snapMinute(minute) };
}

export function isPastDateValue(dateValue, now = new Date()) {
  const [year, month, day] = String(dateValue || '')
    .split('-')
    .map(Number);
  if (!year || !month || !day) return true;
  const selected = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return selected.getTime() < today.getTime();
}

function lastSlotMinutes() {
  return 23 * 60 + 55;
}

export function toDateValue(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseDateValue(dateValue) {
  const [year, month, day] = String(dateValue || '')
    .split('-')
    .map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function minSelectableDateValue(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (now.getHours() * 60 + now.getMinutes() >= lastSlotMinutes()) {
    start.setDate(start.getDate() + 1);
  }
  return toDateValue(start);
}

export function formatInterviewDateLabel(dateValue) {
  const date = parseDateValue(dateValue);
  if (!date) return '';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function minMinuteFor(dateValue, hourValue, now) {
  if (!dateValue || hourValue === '' || hourValue == null) return 0;
  const [year, month, day] = String(dateValue).split('-').map(Number);
  if (!year || !month || !day) return 0;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selected = new Date(year, month - 1, day);
  if (selected.getTime() !== today.getTime()) return 0;
  if (Number(hourValue) !== now.getHours()) {
    return Number(hourValue) < now.getHours() ? 60 : 0;
  }
  return Math.floor(now.getMinutes() / 5) * 5 + 5;
}

export function buildUpcomingDateOptions(now = new Date(), days = 120) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const includeToday = nowMins < lastSlotMinutes();
  const options = [];

  for (let i = includeToday ? 0 : 1; i < days; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    options.push({
      value: `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`,
      label: date.toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    });
  }

  return options;
}

export function ensureDateOption(options, dateValue, now = new Date()) {
  if (!dateValue || options.some((opt) => opt.value === dateValue)) return options;
  if (isPastDateValue(dateValue, now)) return options;
  const [year, month, day] = dateValue.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return options;
  return [
    {
      value: dateValue,
      label: date.toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    },
    ...options,
  ];
}

export function buildHourOptions(dateValue, now = new Date()) {
  const hours = [];
  for (let hour = 0; hour < 24; hour += 1) {
    if (minMinuteFor(dateValue, pad2(hour), now) > 55) continue;
    hours.push({ value: pad2(hour), label: pad2(hour) });
  }
  return hours;
}

export function buildMinuteOptions(dateValue, hourValue, now = new Date()) {
  const minMinute = minMinuteFor(dateValue, hourValue, now);
  const minutes = [];
  for (let minute = 0; minute < 60; minute += 5) {
    if (minute < minMinute) continue;
    minutes.push({ value: pad2(minute), label: pad2(minute) });
  }
  return minutes;
}

export function parseInterviewFormat(text) {
  const value = extractLabeledValue(text, 'Format');
  const match = INTERVIEW_FORMAT_OPTIONS.find(
    (opt) => opt.value.toLowerCase() === String(value || '').trim().toLowerCase()
  );
  return match?.value || '';
}

export function isPlaceholderLocation(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, '-');
  if (!normalized) return true;
  return STOCK_LOCATION_VALUES.some(
    (stock) => normalized === stock || normalized.includes(stock)
  );
}

export function parseInterviewLocation(text) {
  const value = extractLabeledValue(text, 'Location or link');
  return isPlaceholderLocation(value) ? '' : value;
}

export function locationFieldCopy(format) {
  if (format === 'Video call') {
    return {
      label: 'Meeting link',
      placeholder: 'https://meet.google.com/…',
      bodyValue: INTERVIEW_SLOT_PLACEHOLDERS.meetingLink,
    };
  }
  if (format === 'In person') {
    return {
      label: 'Address',
      placeholder: 'Street address',
      bodyValue: INTERVIEW_SLOT_PLACEHOLDERS.address,
    };
  }
  return {
    label: 'Location or link',
    placeholder: 'Meeting link or street address',
    bodyValue: INTERVIEW_SLOT_PLACEHOLDERS.location,
  };
}
