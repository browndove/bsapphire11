export function getApiBaseUrl() {
  return (
    process.env.JOB_API_BASE_URL ||
    process.env.NEXT_PUBLIC_JOB_API_BASE_URL ||
    'http://localhost:8080/api/v1'
  );
}

export const EMPLOYER_APPLICATION_STATUSES = [
  'submitted',
  'reviewing',
  'shortlisted',
  'interview',
  'rejected',
  'hired',
  'withdrawn',
];

export const EMPLOYER_STATUS_UPDATES = [
  'reviewing',
  'shortlisted',
  'interview',
  'rejected',
  'hired',
];

export const JOB_STATUSES = ['draft', 'published', 'closed', 'archived'];

export const REMOTE_TYPES = ['onsite', 'hybrid', 'remote'];

export const EMPLOYMENT_TYPES = [
  'full_time',
  'part_time',
  'contract',
  'internship',
  'temporary',
];

export const DEFAULT_JOB_CURRENCY = 'GHS';
export const JOB_CURRENCY_SYMBOL = '₵';

export const JOB_CURRENCIES = [
  { value: 'GHS', label: '₵ Ghana Cedi (GHS)' },
];
