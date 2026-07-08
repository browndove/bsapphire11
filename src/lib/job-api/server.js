import { getApiBaseUrl } from './config';
import { createHttpError, toUserMessage } from './errors';

export async function apiRequest(path, options = {}, context) {
  const url = `${getApiBaseUrl().replace(/\/$/, '')}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      cache: 'no-store',
    });
  } catch (err) {
    const networkErr = new Error('Could not reach the job portal API.');
    networkErr.status = 502;
    networkErr.cause = err;
    networkErr.message = toUserMessage(networkErr, context);
    throw networkErr;
  }

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

  if (!text || res.status === 204) {
    return data || { ok: true };
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
