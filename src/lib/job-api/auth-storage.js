const ACCESS_KEY = 'job_portal_access_token';
const REFRESH_KEY = 'job_portal_refresh_token';
const USER_KEY = 'job_portal_user';

export const AUTH_EXPIRED_EVENT = 'job-portal-auth-expired';
const SESSION_NOTICE_KEY = 'job_portal_session_notice';

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

export function decodeJwtPayload(token) {
  try {
    const part = String(token || '').split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Epoch ms from a JWT `exp` claim, or null when the token is missing or opaque. */
export function getTokenExpiryMs(token) {
  const exp = Number(decodeJwtPayload(token)?.exp);
  if (!Number.isFinite(exp) || exp <= 0) return null;
  return exp * 1000;
}

export function isTokenExpired(token, skewMs = 10000) {
  const exp = getTokenExpiryMs(token);
  if (exp == null) return false;
  return Date.now() >= exp - skewMs;
}

export function markSessionNotice(notice) {
  if (typeof window === 'undefined' || !notice) return;
  sessionStorage.setItem(SESSION_NOTICE_KEY, notice);
}

/** Read and clear a one-time message, such as a session expiry notice. */
export function consumeSessionNotice() {
  if (typeof window === 'undefined') return '';
  const notice = sessionStorage.getItem(SESSION_NOTICE_KEY) || '';
  if (notice) sessionStorage.removeItem(SESSION_NOTICE_KEY);
  return notice;
}

/** Drop the stored session and tell open portals to return to login. */
export function expireAuthSession() {
  const hadSession = Boolean(getAccessToken() || getRefreshToken() || getStoredUser());
  clearAuthSession();
  if (!hadSession || typeof window === 'undefined') return;
  markSessionNotice('Your session expired. Sign in again to continue.');
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}
