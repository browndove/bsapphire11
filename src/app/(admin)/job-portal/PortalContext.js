'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  clearAuthSession,
  getAccessToken,
  getStoredUser,
} from '@/lib/job-api/auth-storage';
import {
  createEmployerJob,
  deleteEmployerJob,
  fetchCategories,
  fetchDashboard,
  fetchEmployerApplications,
  fetchEmployerJob,
  fetchEmployerJobs,
  fetchMe,
  logoutApi,
  renewSession,
  updateApplicationStatus,
  updateEmployerJob,
  verify2FA,
  loginStep1,
  updateProfile,
} from '@/lib/job-api/client';
import { toUserMessage } from '@/lib/job-api/errors';
import { isWithinDays } from '@/lib/job-api/format';
import {
  getEmployerStatusUpdates,
  getPaginatedItems,
  getPaginatedTotal,
  getPipelineStatuses,
  mapApplicationFromApi,
  mapJobFromApi,
  mapJobToApi,
  matchesScreeningFilters,
  PortalStages,
} from '@/lib/job-api/mappers';
import {
  buildStatusEmailDefaults,
  buildStatusEmailPatch,
} from '@/lib/job-api/email-templates';
import { isPortalPreview, loadPreviewData } from '@/lib/job-api/preview';

const ALREADY_SETTLED_ON_HIRE = new Set(['rejected', 'hired']);

function isApplicantStillOpen(app, hiredId) {
  return app.id !== hiredId && !ALREADY_SETTLED_ON_HIRE.has(app.status);
}

/** Upstream often caps page size (~20) even when a higher limit is requested. */
async function fetchAllApplicationPages(params = {}) {
  // Match the common upstream page size so "short page" detection is reliable
  // when `total` is missing from the response.
  const pageSize = 20;
  const { limit: _limit, offset: _offset, ...filterParams } = params;
  const seen = new Set();
  const all = [];
  let offset = 0;
  let total = null;
  let appliedFilters = {};
  let appliedNumericFilters;

  for (;;) {
    const appsRes = await fetchEmployerApplications({
      ...filterParams,
      limit: pageSize,
      offset,
    });
    const appRows = getPaginatedItems(appsRes);
    // Only trust an explicit total — getPaginatedTotal falls back to page
    // length, which would stop pagination after the first capped page.
    if (total == null && appsRes?.total != null && Number.isFinite(Number(appsRes.total))) {
      total = Number(appsRes.total);
    }
    if (appsRes?.applied_filters) appliedFilters = appsRes.applied_filters;
    if (appsRes?.applied_numeric_filters) {
      appliedNumericFilters = appsRes.applied_numeric_filters;
    }

    let added = 0;
    for (const row of appRows || []) {
      const mapped = mapApplicationFromApi(row);
      if (!mapped) continue;
      if (mapped.id) {
        if (seen.has(mapped.id)) continue;
        seen.add(mapped.id);
      }
      all.push(mapped);
      added += 1;
    }

    const received = (appRows || []).length;
    offset += received;
    if (!received || added === 0) break;
    if (total != null && seen.size >= total) break;
    if (received < pageSize) break;
    if (all.length >= 10000) break;
  }

  return {
    applications: all,
    total: total ?? all.length,
    appliedFilters,
    appliedNumericFilters,
  };
}

const PIPELINE_STATUSES = getPipelineStatuses();
const STATUS_UPDATE_OPTIONS = getEmployerStatusUpdates();

const PortalContext = createContext();

export { PortalStages };

export function PortalProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [applicationsTotal, setApplicationsTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const categoriesRef = useRef([]);
  const jobsRef = useRef([]);
  const lastCountsRefreshAt = useRef(0);
  categoriesRef.current = categories;
  jobsRef.current = jobs;
  const previewMode = isPortalPreview();

  const applyPreviewData = useCallback(() => {
    const data = loadPreviewData();
    setUser(data.user);
    setCategories(data.categories);
    setJobs(data.jobs);
    setApplications(data.applications);
    setApplicationsTotal(data.applications.length);
    setDashboardStats(data.dashboardStats);
    setIsAuthed(true);
  }, []);

  const categoriesById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  );

  const applicationsByJobId = useMemo(() => {
    const map = {};
    applications.forEach((app) => {
      const jobId = app.jobId || app.job_id || '';
      if (!jobId) return;
      if (!map[jobId]) map[jobId] = [];
      map[jobId].push(app);
    });
    return map;
  }, [applications]);

  const applicationsByStatus = useMemo(() => {
    const map = {};
    applications.forEach((app) => {
      if (!map[app.status]) map[app.status] = [];
      map[app.status].push(app);
    });
    return map;
  }, [applications]);

  const getApplicantCount = useCallback(
    (jobId) => {
      const fromApps = (applicationsByJobId[jobId] || []).length;
      const job = jobs.find((j) => j.id === jobId);
      const fromJob =
        job?.applicationCount != null && Number.isFinite(Number(job.applicationCount))
          ? Number(job.applicationCount)
          : 0;
      return Math.max(fromApps, fromJob);
    },
    [applicationsByJobId, jobs]
  );

  const refreshData = useCallback(async () => {
    if (previewMode) {
      applyPreviewData();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [cats, dashRes, jobsRes, appsPage] = await Promise.all([
        fetchCategories().catch(() => ({ data: [] })),
        fetchDashboard().catch(() => null),
        fetchEmployerJobs({ limit: 200, offset: 0 }),
        fetchAllApplicationPages(),
      ]);

      const catList = getPaginatedItems(cats);
      const byId = Object.fromEntries(catList.map((c) => [c.id, c]));
      const jobRows = getPaginatedItems(jobsRes);

      setCategories(catList);
      setDashboardStats(dashRes);
      setJobs(jobRows.map((job) => mapJobFromApi(job, byId)));
      setApplications(appsPage.applications);
      setApplicationsTotal(appsPage.total);
      lastCountsRefreshAt.current = Date.now();
    } catch (err) {
      setError(toUserMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [previewMode, applyPreviewData]);

  /** Quiet refresh so applicant counts update after people apply (no full-page skeleton). */
  const refreshCounts = useCallback(async ({ force = false } = {}) => {
    if (previewMode || !getAccessToken()) return;

    const now = Date.now();
    // Avoid rapid re-fetches (focus churn / remounts) that rewrite state and flicker the UI.
    if (!force && now - lastCountsRefreshAt.current < 15000) return;
    lastCountsRefreshAt.current = now;

    try {
      const [dashRes, jobsRes, appsPage] = await Promise.all([
        fetchDashboard().catch(() => null),
        fetchEmployerJobs({ limit: 200, offset: 0 }),
        fetchAllApplicationPages(),
      ]);
      const catById = Object.fromEntries(categoriesRef.current.map((c) => [c.id, c]));
      const jobRows = getPaginatedItems(jobsRes);

      if (dashRes) setDashboardStats(dashRes);
      setJobs(jobRows.map((job) => mapJobFromApi(job, catById)));
      setApplications(appsPage.applications);
      setApplicationsTotal(appsPage.total);
    } catch {
      // Keep existing counts if a background refresh fails.
    }
  }, [previewMode]);

  const loadApplications = useCallback(async (params = {}) => {
    if (previewMode) {
      const data = loadPreviewData();
      let rows = data.applications.map((a) => ({ ...a }));
      if (params.job_id) {
        rows = rows.filter((a) => a.jobId === params.job_id);
      }
      if (params.status) {
        rows = rows.filter((a) => a.status === params.status);
      }
      if (params.q) {
        const q = String(params.q).toLowerCase();
        rows = rows.filter((a) => {
          const name = (a.candidateName || '').toLowerCase();
          const email = (a.email || '').toLowerCase();
          const phone = (a.phone || '').toLowerCase();
          return name.includes(q) || email.includes(q) || phone.includes(q);
        });
      }
      if (params.screeningFilters || params.numericFilters) {
        rows = rows.filter((a) =>
          matchesScreeningFilters(a, params.screeningFilters || {}, params.numericFilters || {})
        );
      }
      if (params.sort_by && String(params.sort_by).startsWith('answer_')) {
        const qid = String(params.sort_by).slice('answer_'.length);
        const dir = params.sort_dir === 'asc' ? 1 : -1;
        rows = [...rows].sort((a, b) => {
          const av = Number(a.answers?.[qid]);
          const bv = Number(b.answers?.[qid]);
          const aMissing = !Number.isFinite(av);
          const bMissing = !Number.isFinite(bv);
          if (aMissing && bMissing) return 0;
          if (aMissing) return 1;
          if (bMissing) return -1;
          if (av !== bv) return (av - bv) * dir;
          return 0;
        });
      }
      const mapped = rows.map((a) => mapApplicationFromApi(a));
      return {
        applications: mapped,
        total: mapped.length,
        appliedFilters: params.screeningFilters || {},
        appliedNumericFilters: params.numericFilters || {},
      };
    }

    const appsRes = await fetchEmployerApplications(params);
    const appRows = getPaginatedItems(appsRes);
    const mappedApps = appRows.map(mapApplicationFromApi);
    return {
      applications: mappedApps,
      total: getPaginatedTotal(appsRes, appRows),
      appliedFilters: appsRes?.applied_filters || {},
      appliedNumericFilters: appsRes?.applied_numeric_filters || {},
    };
  }, [previewMode]);

  /** Walk every page — upstream often caps page size (~20) even when limit is higher. */
  const loadAllApplications = useCallback(
    async (params = {}) => {
      if (previewMode) {
        return loadApplications(params);
      }
      return fetchAllApplicationPages(params);
    },
    [previewMode, loadApplications]
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = getAccessToken();
      const storedUser = getStoredUser();

      if (!token) {
        if (previewMode) {
          if (!cancelled) {
            applyPreviewData();
            setIsReady(true);
          }
          return;
        }
        if (!cancelled) {
          setIsAuthed(false);
          setIsReady(true);
        }
        return;
      }

      try {
        let currentUser = storedUser;
        try {
          currentUser = await fetchMe();
        } catch {
          await renewSession();
          currentUser = await fetchMe();
        }

        if (cancelled) return;

        if (currentUser?.role !== 'employer') {
          clearAuthSession();
          setIsAuthed(false);
          setUser(null);
          setIsReady(true);
          return;
        }

        setUser(currentUser);
        setIsAuthed(true);
        await refreshData();
      } catch {
        if (!cancelled) {
          clearAuthSession();
          setIsAuthed(false);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [refreshData, previewMode, applyPreviewData]);

  // Re-fetch applications when the employer returns to the tab so applicant counts update.
  useEffect(() => {
    if (!isReady || !isAuthed || previewMode) return undefined;

    let timer = null;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        refreshCounts();
      }, 800);
    };

    const onFocus = () => schedule();
    const onVisible = () => {
      if (document.visibilityState === 'visible') schedule();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isReady, isAuthed, previewMode, refreshCounts]);

  const beginLogin = async (email, password) => {
    setError(null);
    return loginStep1(email, password);
  };

  const completeLogin = async (pendingToken, code) => {
    setError(null);
    const data = await verify2FA(pendingToken, code);
    if (data.user?.role !== 'employer') {
      await logoutApi();
      const err = new Error('This portal is for employer accounts only.');
      setError(err.message);
      throw err;
    }
    setUser(data.user);
    setIsAuthed(true);
    await refreshData();
    return data;
  };

  const logout = async () => {
    if (previewMode) {
      applyPreviewData();
      return;
    }
    await logoutApi();
    setIsAuthed(false);
    setUser(null);
    setJobs([]);
    setApplications([]);
    setDashboardStats(null);
  };

  const upsertJob = async (job) => {
    if (previewMode) {
      const mapped = {
        ...job,
        id: job.id || `preview-job-${Date.now()}`,
        updatedAt: new Date().toISOString(),
        createdAt: job.createdAt || new Date().toISOString(),
      };
      setJobs((prev) => {
        const idx = prev.findIndex((j) => j.id === mapped.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = mapped;
          return next;
        }
        return [...prev, mapped];
      });
      return mapped;
    }

    const payload = mapJobToApi(job, { isCreate: !job.id });
    let saved;
    if (job.id) {
      saved = await updateEmployerJob(job.id, payload);
    } else {
      saved = await createEmployerJob(payload);
    }
    const mapped = mapJobFromApi(saved?.data || saved, categoriesById);
    setJobs((prev) => {
      const idx = prev.findIndex((j) => j.id === mapped.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = mapped;
        return next;
      }
      return [...prev, mapped];
    });
    return mapped;
  };

  const removeJob = async (id) => {
    if (previewMode) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setApplications((prev) => prev.filter((a) => a.jobId !== id));
      return;
    }

    await deleteEmployerJob(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setApplications((prev) => prev.filter((a) => a.jobId !== id));
  };

  const loadJobById = useCallback(async (id) => {
    if (previewMode) {
      const found = jobsRef.current.find((j) => j.id === id);
      if (!found) throw new Error('Job not found');
      return { ...found };
    }

    const res = await fetchEmployerJob(id);
    const catById = Object.fromEntries(categoriesRef.current.map((c) => [c.id, c]));
    const mapped = mapJobFromApi(res?.data || res, catById);
    if (!mapped) throw new Error('Job not found');

    setJobs((prev) => {
      const idx = prev.findIndex((j) => j.id === id);
      if (idx >= 0) {
        const existing = prev[idx];
        // Skip state update when nothing meaningful changed — avoids
        // re-render storms that make the candidates board twitch.
        if (
          existing.title === mapped.title &&
          existing.status === mapped.status &&
          existing.applicationCount === mapped.applicationCount &&
          JSON.stringify(existing.screeningQuestions || []) ===
            JSON.stringify(mapped.screeningQuestions || [])
        ) {
          return prev;
        }
        const next = [...prev];
        next[idx] = { ...existing, ...mapped };
        return next;
      }
      return [...prev, mapped];
    });

    return mapped;
  }, [previewMode]);

  const mergeApplications = useCallback((rows = []) => {
    if (!rows?.length) return;
    setApplications((prev) => {
      const byId = new Map(prev.map((a) => [a.id, a]));
      for (const row of rows) {
        if (row?.id) byId.set(row.id, row);
      }
      const next = Array.from(byId.values());
      setApplicationsTotal((total) => Math.max(total || 0, next.length));
      return next;
    });
  }, []);

  const upsertApplication = async (app) => {
    if (previewMode) {
      const mapped = { ...app };
      setApplications((prev) => {
        const idx = prev.findIndex((a) => a.id === mapped.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...mapped };
          return next;
        }
        return [...prev, mapped];
      });
      return mapped;
    }

    throw new Error('Use updateApplicationWithEmail to change application status.');
  };

  const updateApplicationWithEmail = async (id, emailPayload) => {
    const existing = applications.find((a) => a.id === id);

    if (previewMode) {
      const mapped = {
        ...(existing || { id }),
        status: emailPayload.status,
        interviewAt: emailPayload.interview_at || existing?.interviewAt || null,
        emailSent: true,
        emailError: '',
      };
      setApplications((prev) => {
        const idx = prev.findIndex((a) => a.id === id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...mapped };
          return next;
        }
        return [...prev, mapped];
      });
      return { application: mapped, emailWarning: '' };
    }

    const updated = await updateApplicationStatus(id, emailPayload);
    const raw = updated?.data || updated;
    const mapped = mapApplicationFromApi(raw);
    setApplications((prev) => {
      const idx = prev.findIndex((a) => a.id === mapped.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...mapped };
        return next;
      }
      return [...prev, mapped];
    });

    // Backend contract: email_sent === true means Resend accepted the send.
    // Anything else after a status update must surface as a warning.
    const emailSent = raw?.email_sent === true || mapped.emailSent === true;
    const emailError =
      raw?.email_error ||
      mapped.emailError ||
      'Status was saved but the email could not be sent. Retry or contact the candidate manually.';

    return {
      application: { ...mapped, emailSent, emailError: emailSent ? '' : emailError },
      emailWarning: emailSent ? '' : emailError,
    };
  };

  const countOtherOpenApplicants = useCallback(
    (jobId, hiredId) =>
      applications.filter((a) => a.jobId === jobId && isApplicantStillOpen(a, hiredId))
        .length,
    [applications]
  );

  const loadAllApplicantsForJob = async (jobId) => {
    if (previewMode) {
      return applications.filter((a) => a.jobId === jobId);
    }

    const { applications: rows } = await loadAllApplications({ job_id: jobId });
    return rows || [];
  };

  /**
   * After hiring one candidate: reject every other applicant for the job
   * (anyone not already hired/rejected), email them a rejection, and close
   * the job posting.
   */
  const finalizeHirePipeline = async (hiredId, hirePayload) => {
    const hireResult = await updateApplicationWithEmail(hiredId, hirePayload);
    const hired = hireResult.application;
    const jobId = hired.jobId;
    if (!jobId) {
      return {
        ...hireResult,
        rejectedCount: 0,
        rejectionEmailFailures: 0,
        rejectionFailures: [],
        jobClosed: false,
        jobCloseError: 'Hired candidate is missing a job id; other applicants were not rejected.',
      };
    }

    const job =
      jobs.find((j) => j.id === jobId) ||
      (await loadJobById(jobId).catch(() => null));
    const companyName = hired.companyName || job?.companyName || 'Blvck Sapphire';

    let allForJob = [];
    try {
      allForJob = await loadAllApplicantsForJob(jobId);
    } catch (err) {
      // Prefer in-memory over aborting after a successful hire
      allForJob = applications.filter((a) => a.jobId === jobId);
      if (!allForJob.length) {
        return {
          ...hireResult,
          rejectedCount: 0,
          rejectionEmailFailures: 0,
          rejectionFailures: [
            {
              id: jobId,
              name: 'all other applicants',
              message: toUserMessage(err),
            },
          ],
          jobClosed: false,
          jobCloseError: 'Could not load other applicants to reject them.',
        };
      }
    }

    const siblings = allForJob.filter((a) => isApplicantStillOpen(a, hiredId));

    const rejectionFailures = [];
    let rejectedCount = 0;
    let rejectionEmailFailures = 0;

    for (const other of siblings) {
      try {
        const defaults = buildStatusEmailDefaults(
          other,
          job,
          companyName,
          'rejected'
        );
        const rejectPayload = buildStatusEmailPatch({
          status: 'rejected',
          emailSubject: defaults.fields.emailSubject,
          emailBody: defaults.fields.emailBody,
        });

        if (previewMode) {
          setApplications((prev) =>
            prev.map((a) => (a.id === other.id ? { ...a, status: 'rejected' } : a))
          );
          rejectedCount += 1;
          continue;
        }

        const { emailWarning } = await updateApplicationWithEmail(
          other.id,
          rejectPayload
        );
        rejectedCount += 1;
        if (emailWarning) rejectionEmailFailures += 1;
      } catch (err) {
        rejectionFailures.push({
          id: other.id,
          name: other.candidateName || other.email || other.id,
          message: toUserMessage(err, 'status-email'),
        });
      }
    }

    // Second pass: anyone still not hired/rejected must be reported
    let leftover = [];
    try {
      const after = await loadAllApplicantsForJob(jobId);
      leftover = after.filter((a) => isApplicantStillOpen(a, hiredId));
      for (const left of leftover) {
        if (rejectionFailures.some((f) => f.id === left.id)) continue;
        rejectionFailures.push({
          id: left.id,
          name: left.candidateName || left.email || left.id,
          message: 'Still not rejected after hire cascade.',
        });
      }
    } catch {
      // ignore verification fetch errors
    }

    let jobClosed = false;
    let jobCloseError = '';
    if (job && job.status !== 'closed' && job.status !== 'archived') {
      try {
        await upsertJob({ ...job, status: 'closed' });
        jobClosed = true;
      } catch (err) {
        jobCloseError = toUserMessage(err, 'job');
      }
    } else if (job?.status === 'closed' || job?.status === 'archived') {
      jobClosed = true;
    }

    return {
      ...hireResult,
      rejectedCount,
      rejectionEmailFailures,
      rejectionFailures,
      leftoverCount: leftover.length,
      jobClosed,
      jobCloseError,
    };
  };

  const moveApplication = async (id, status) => {
    const existing = applications.find((a) => a.id === id);
    if (!existing) return;

    if (!previewMode) {
      throw new Error('Use updateApplicationWithEmail to change application status.');
    }

    const prevStatus = existing.status;
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );

    try {
      return await upsertApplication({ ...existing, status });
    } catch (err) {
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: prevStatus } : a))
      );
      throw err;
    }
  };

  const saveProfile = async (body) => {
    if (previewMode) {
      const next = { ...user, ...body };
      setUser(next);
      return { user: next };
    }
    const data = await updateProfile(body);
    const nextUser = data?.user || data;
    if (nextUser) setUser(nextUser);
    return data;
  };

  const newThisWeek = useMemo(
    () => applications.filter((a) => isWithinDays(a.submittedAt, 7)).length,
    [applications]
  );

  const inInterview = useMemo(
    () => applications.filter((a) => a.status === 'interview').length,
    [applications]
  );

  return (
    <PortalContext.Provider
      value={{
        isReady,
        isAuthed,
        isPreview: previewMode,
        user,
        loading,
        error,
        login: beginLogin,
        completeLogin,
        logout,
        saveProfile,
        jobs,
        applications,
        applicationsTotal,
        applicationsByJobId,
        applicationsByStatus,
        getApplicantCount,
        categories,
        dashboardStats,
        newThisWeek,
        inInterview,
        upsertJob,
        removeJob,
        loadJobById,
        upsertApplication,
        mergeApplications,
        updateApplicationWithEmail,
        finalizeHirePipeline,
        countOtherOpenApplicants,
        moveApplication,
        refreshData,
        refreshCounts,
        loadApplications,
        loadAllApplications,
        PIPELINE_STATUSES,
        STATUS_UPDATE_OPTIONS,
        PortalStages,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
}
