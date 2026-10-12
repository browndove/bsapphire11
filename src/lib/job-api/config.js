const DEFAULT_LOCAL_API_BASE_URL = 'http://localhost:8080/api/v1';
const DEFAULT_PRODUCTION_API_BASE_URL = 'https://jobportal.blvcksapphire.com/api/v1';

export function getApiBaseUrl() {
  return (
    process.env.JOB_API_BASE_URL ||
    process.env.NEXT_PUBLIC_JOB_API_BASE_URL ||
    (process.env.NODE_ENV === 'production'
      ? DEFAULT_PRODUCTION_API_BASE_URL
      : DEFAULT_LOCAL_API_BASE_URL)
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
  { value: 'GHS', label: '₵ Ghana Cedi (GHS)', symbol: '₵', name: 'Ghana Cedis' },
  { value: 'USD', label: '$ US Dollar (USD)', symbol: '$', name: 'US Dollars' },
  { value: 'EUR', label: '€ Euro (EUR)', symbol: '€', name: 'Euros' },
  { value: 'GBP', label: '£ British Pound (GBP)', symbol: '£', name: 'British Pounds' },
];

export function currencyMeta(code) {
  return (
    JOB_CURRENCIES.find((item) => item.value === code) || {
      value: code || DEFAULT_JOB_CURRENCY,
      label: code || DEFAULT_JOB_CURRENCY,
      symbol: code || JOB_CURRENCY_SYMBOL,
      name: code || 'the selected currency',
    }
  );
}
