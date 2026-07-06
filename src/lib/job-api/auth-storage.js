const ACCESS_KEY = 'job_portal_access_token';
const REFRESH_KEY = 'job_portal_refresh_token';
const USER_KEY = 'job_portal_user';

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(REFRESH_KEY);
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuthSession({ access_token, refresh_token, user }) {
  if (typeof window === 'undefined') return;
  if (access_token) sessionStorage.setItem(ACCESS_KEY, access_token);
  if (refresh_token) sessionStorage.setItem(REFRESH_KEY, refresh_token);
  if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(USER_KEY);
}
