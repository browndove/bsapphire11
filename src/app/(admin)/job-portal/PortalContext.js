'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearAuthSession,
  getAccessToken,
  getStoredUser,
} from '@/lib/job-api/auth-storage';
import {
  createEmployerJob,
  fetchCategories,
  fetchDashboard,
  fetchEmployerApplications,
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
  PortalStages,
} from '@/lib/job-api/mappers';
import { isPortalPreview, loadPreviewData } from '@/lib/job-api/preview';

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
      if (!map[app.jobId]) map[app.jobId] = [];
      map[app.jobId].push(app);
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
    (jobId) => (applicationsByJobId[jobId] || []).length,
    [applicationsByJobId]
  );

  const refreshData = useCallback(async () => {
    if (previewMode) {
      applyPreviewData();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [cats, dashRes, jobsRes, appsRes] = await Promise.all([
        fetchCategories().catch(() => ({ data: [] })),
        fetchDashboard().catch(() => null),
        fetchEmployerJobs({ limit: 200, offset: 0 }),
        fetchEmployerApplications({ limit: 500, offset: 0 }),
      ]);

      const catList = getPaginatedItems(cats);
      const byId = Object.fromEntries(catList.map((c) => [c.id, c]));
      const jobRows = getPaginatedItems(jobsRes);
      const appRows = getPaginatedItems(appsRes);

      // Hydrate missing candidate names by fetching user records when possible.
      try {
        const idsToFetch = Array.from(
          new Set(
            appRows
              .map((a) => a.candidate_id || a.candidateId || a.candidate?.id)
              .filter(Boolean)
          )
        );
        if (idsToFetch.length > 0) {
          const userMap = {};
          await Promise.all(
            idsToFetch.map(async (id) => {
              try {
                const res = await fetchEmployerUsers({ id });
                const rows = Array.isArray(res) ? res : res?.data || [];
                const u = rows[0] || null;
                if (u) userMap[id] = u;
              } catch (err) {
                // ignore; we'll simply not hydrate that id
              }
            })
          );
          // apply hydrated names back to appRows
          appRows.forEach((a) => {
            const cid = a.candidate_id || a.candidateId || a.candidate?.id;
            const u = cid ? userMap[cid] : null;
            if (u) {
              if (!a.candidate) a.candidate = {};
              if (u.first_name && !a.candidate.first_name) a.candidate.first_name = u.first_name;
              if (u.last_name && !a.candidate.last_name) a.candidate.last_name = u.last_name;
              if (!a.candidate_name && (u.first_name || u.last_name)) {
                a.candidate_name = [u.first_name, u.last_name].filter(Boolean).join(' ');
              }
            }
          });
          // small debug log
          // console.log('Hydrated candidate names for ids:', Object.keys(userMap));
        }
      } catch (err) {
        // don't block data refresh on hydration failure
      }

      // Debug logging: show raw + mapped application samples to verify API payload shape
      try {
        // limit output to first 3 records to avoid noisy logs
        console.log('PORTAL: RAW appRows sample:', (appRows || []).slice(0, 3));
      } catch (e) {
        /* ignore logging errors */
      }

      const mappedApps = (appRows || []).map(mapApplicationFromApi);
      try {
        console.log('PORTAL: MAPPED applications sample:', mappedApps.slice(0, 3));
      } catch (e) {
        /* ignore logging errors */
      }

      setCategories(catList);
      setDashboardStats(dashRes);
      setJobs(jobRows.map((job) => mapJobFromApi(job, byId)));
      setApplications(mappedApps);
      setApplicationsTotal(getPaginatedTotal(appsRes, appRows));
    } catch (err) {
      setError(toUserMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [previewMode, applyPreviewData]);

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

  const loadJobById = async (id) => {
    if (previewMode) {
      const found = jobs.find((j) => j.id === id);
      if (!found) throw new Error('Job not found');
      return { ...found };
    }

    const cached = jobs.find((j) => j.id === id);
    if (cached) return { ...cached };

    const res = await fetchEmployerJobs({ limit: 200, offset: 0 });
    const found = getPaginatedItems(res).find((j) => j.id === id);
    if (!found) throw new Error('Job not found');
    return mapJobFromApi(found, categoriesById);
  };

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

    const updated = await updateApplicationStatus(app.id, app.status);
    const mapped = mapApplicationFromApi(updated?.data || updated);
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
  };

  const moveApplication = async (id, status) => {
    const existing = applications.find((a) => a.id === id);
    if (!existing) return;

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

  const PIPELINE_STATUSES = getPipelineStatuses();
  const STATUS_UPDATE_OPTIONS = getEmployerStatusUpdates();

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
        loadJobById,
        upsertApplication,
        moveApplication,
        refreshData,
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
