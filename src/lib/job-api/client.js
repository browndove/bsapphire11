import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAuthSession,
} from './auth-storage';
import { createHttpError } from './errors';

async function parseResponse(res, context) {
  const text = await res.text();
  let data = null;
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
  // DELETE and some success responses return 204 / empty body
  if (!text || res.status === 204) {
    return data || { ok: true };
  }
  return data;
}

async function portalFetch(path, options = {}, retry = true, context) {
  const token = getAccessToken();
  const res = await fetch(`/api/job-portal${path}`, {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && retry && getRefreshToken()) {
    try {
      await renewSession();
      return portalFetch(path, options, false, context);
    } catch {
      clearAuthSession();
      throw await parseResponse(res, context);
    }
  }

  return parseResponse(res, context);
}

export async function renewSession() {
  const refresh_token = getRefreshToken();
  const data = await parseResponse(
    await fetch('/api/job-portal/auth/renew', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token }),
    })
  );
  setAuthSession(data);
  return data;
}

export async function loginStep1(email, password) {
  return portalFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, true, 'login');
}

export async function verify2FA(pending_token, code) {
  const data = await portalFetch('/auth/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({ pending_token, code }),
  }, true, '2fa');
  setAuthSession(data);
  return data;
}

export async function fetchMe() {
  const data = await portalFetch('/auth/me');
  if (data?.user) setAuthSession({ user: data.user });
  return data.user;
}

export async function updateProfile(body) {
  const data = await portalFetch('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  }, true, 'profile');
  if (data?.user) setAuthSession({ user: data.user });
  return data;
}

export async function fetchPublicCompany() {
  const res = await fetch(`/api/public/company?_=${Date.now()}`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  });
  return parseResponse(res);
}

export async function fetchEmployerCompany() {
  return portalFetch('/employer/company');
}

export async function updateEmployerCompany(body) {
  return portalFetch('/employer/company', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function createEmployerCategory(body) {
  return portalFetch('/employer/categories', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateEmployerCategory(id, body) {
  return portalFetch(`/employer/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteEmployerCategory(id) {
  return portalFetch(`/employer/categories/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchEmployerUsers(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') qs.set(key, String(value));
  });
  const query = qs.toString();
  return portalFetch(`/employer/users${query ? `?${query}` : ''}`);
}

export async function updateEmployerUserStatus(id, body) {
  return portalFetch(`/employer/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function withdrawApplication(id) {
  return portalFetch(`/me/applications/${id}/withdraw`, {
    method: 'PATCH',
  });
}

export async function logoutApi() {
  try {
    await portalFetch('/auth/logout', { method: 'POST' });
  } finally {
    clearAuthSession();
  }
}

export async function fetchDashboard() {
  return portalFetch('/employer/dashboard');
}

export async function fetchEmployerJobs(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.limit != null) qs.set('limit', String(params.limit));
  if (params.offset != null) qs.set('offset', String(params.offset));
  const query = qs.toString();
  return portalFetch(`/employer/jobs${query ? `?${query}` : ''}`);
}

export async function fetchEmployerJob(id) {
  return portalFetch(`/employer/jobs/${id}`);
}

export async function createEmployerJob(job) {
  return portalFetch('/employer/jobs', {
    method: 'POST',
    body: JSON.stringify(job),
  }, true, 'job');
}

export async function updateEmployerJob(id, job) {
  return portalFetch(`/employer/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(job),
  }, true, 'job');
}

export async function deleteEmployerJob(id) {
  return portalFetch(`/employer/jobs/${id}`, {
    method: 'DELETE',
  }, true, 'job');
}

export async function fetchEmployerApplications(params = {}) {
  const qs = new URLSearchParams();
  if (params.job_id) qs.set('job_id', params.job_id);
  if (params.status) qs.set('status', params.status);
  if (params.q) qs.set('q', params.q);
  if (params.limit != null) qs.set('limit', String(params.limit));
  if (params.offset != null) qs.set('offset', String(params.offset));

  const screeningFilters = params.screeningFilters || {};
  for (const [qid, opts] of Object.entries(screeningFilters)) {
    if (!Array.isArray(opts)) continue;
    for (const opt of opts) {
      if (opt != null && opt !== '') qs.append(`answer_${qid}`, String(opt));
    }
  }

  for (const [key, value] of Object.entries(params)) {
    if (!key.startsWith('answer_') || value == null || value === '') continue;
    const values = Array.isArray(value) ? value : [value];
    for (const opt of values) {
      if (opt != null && opt !== '') qs.append(key, String(opt));
    }
  }

  const query = qs.toString();
  return portalFetch(`/employer/applications${query ? `?${query}` : ''}`);
}

export async function fetchJobApplications(jobId, params = {}) {
  const qs = new URLSearchParams();
  if (params.limit != null) qs.set('limit', String(params.limit));
  if (params.offset != null) qs.set('offset', String(params.offset));
  const query = qs.toString();
  return portalFetch(`/employer/jobs/${jobId}/applications${query ? `?${query}` : ''}`);
}

export async function updateApplicationStatus(id, statusOrPayload) {
  const body =
    typeof statusOrPayload === 'string'
      ? { status: statusOrPayload }
      : statusOrPayload;
  return portalFetch(
    `/employer/applications/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
    true,
    'status-email'
  );
}

export async function fetchCategories() {
  return portalFetch('/categories');
}

export async function fetchPublicJobs(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') qs.set(key, String(value));
  });
  qs.set('_', String(Date.now()));
  const query = qs.toString();
  const res = await fetch(`/api/public/jobs?${query}`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  });
  return parseResponse(res);
}

export async function fetchPublicJob(id) {
  const res = await fetch(`/api/public/jobs/${encodeURIComponent(id)}?_=${Date.now()}`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  });
  return parseResponse(res);
}

export async function candidateLoginStep1(email, password) {
  const res = await fetch('/api/job-portal/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseResponse(res, 'login');
}

export async function candidateRegister(body) {
  const res = await fetch('/api/job-portal/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseResponse(res, 'register');
}

export async function candidateVerify2FA(pending_token, code) {
  const data = await parseResponse(
    await fetch('/api/job-portal/auth/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pending_token, code }),
    }),
    '2fa'
  );
  setAuthSession(data);
  return data;
}

export async function uploadFile(file, purpose = 'document') {
  const token = getAccessToken();
  if (!token) {
    const err = new Error('Sign in to upload files.');
    err.status = 401;
    throw err;
  }

  const contentType = file.type || 'application/octet-stream';
  const meta = await parseResponse(
    await fetch('/api/job-portal/files/upload-url', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content_type: contentType,
        filename: file.name,
        purpose,
      }),
    }),
    'upload'
  );

  const putRes = await fetch(meta.upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });

  if (!putRes.ok) {
    const err = new Error('File upload to storage failed. Please try again.');
    err.status = putRes.status;
    throw err;
  }

  return meta.file_url;
}

export async function uploadResume(file) {
  const fileUrl = await uploadFile(file, 'resume');
  return { url: fileUrl, file_url: fileUrl };
}

async function uploadPublicFile(file, purpose = 'resume') {
  const contentType = file.type || 'application/octet-stream';
  const meta = await parseResponse(
    await fetch('/api/public/files/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_type: contentType,
        filename: file.name,
        purpose,
      }),
    }),
    'upload'
  );

  const putRes = await fetch(meta.upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });

  if (!putRes.ok) {
    const err = new Error('File upload to storage failed. Please try again.');
    err.status = putRes.status;
    throw err;
  }

  return meta.file_url;
}

export async function uploadResumePublic(file) {
  const fileUrl = await uploadPublicFile(file, 'resume');
  return { url: fileUrl, file_url: fileUrl };
}

/** Guest cover letters use purpose `resume` (public upload allowlist). */
export async function uploadCoverLetterPublic(file) {
  const fileUrl = await uploadPublicFile(file, 'resume');
  return { url: fileUrl, file_url: fileUrl };
}

export async function uploadCoverLetter(file) {
  const fileUrl = await uploadFile(file, 'document');
  return { url: fileUrl, file_url: fileUrl };
}

export async function submitGuestApplication(jobId, body) {
  const res = await fetch(`/api/public/jobs/${encodeURIComponent(jobId)}/applications`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseResponse(res, 'guest-apply');
}

export async function submitApplication(body) {
  return portalFetch('/me/applications', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchMyApplications() {
  return portalFetch('/me/applications');
}
