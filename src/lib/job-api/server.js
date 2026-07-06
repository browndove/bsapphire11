import { getApiBaseUrl } from './config';
import { createHttpError } from './errors';

export async function apiRequest(path, options = {}, context) {
  const url = `${getApiBaseUrl().replace(/\/$/, '')}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store',
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    throw createHttpError(res, data, context);
  }

  return data;
}

export function getBearerToken(request) {
  const header = request.headers.get('authorization') || '';
  if (header.toLowerCase().startsWith('bearer ')) {
    return header.slice(7).trim();
  }
  return null;
}
