'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  clearAuthSession,
  getAccessToken,
  getStoredUser,
} from '@/lib/job-api/auth-storage';
import {
  candidateLoginStep1,
  candidateRegister,
  candidateVerify2FA,
  fetchMe,
  fetchMyApplications,
  logoutApi,
  renewSession,
  updateProfile,
  withdrawApplication,
} from '@/lib/job-api/client';
import { getPaginatedItems, mapApplicationFromApi } from '@/lib/job-api/mappers';
import { toUserMessage } from '@/lib/job-api/errors';

const CandidateContext = createContext();

export function CandidateProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMyApplications();
      const list = getPaginatedItems(res);
      setApplications(list.map(mapApplicationFromApi));
    } catch (err) {
      setError(toUserMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = getAccessToken();
      if (!token) {
        if (!cancelled) {
          setIsAuthed(false);
          setIsReady(true);
        }
        return;
      }

      try {
        let currentUser = getStoredUser();
        try {
          currentUser = await fetchMe();
        } catch {
          await renewSession();
          currentUser = await fetchMe();
        }

        if (cancelled) return;

        if (currentUser?.role !== 'candidate') {
          clearAuthSession();
          setIsAuthed(false);
          setUser(null);
          setIsReady(true);
          return;
        }

        setUser(currentUser);
        setIsAuthed(true);
        await refreshApplications();
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
  }, [refreshApplications]);

  const beginLogin = async (email, password) => {
    setError(null);
    return candidateLoginStep1(email, password);
  };

  const beginRegister = async (fields) => {
    setError(null);
    return candidateRegister(fields);
  };

  const completeLogin = async (pendingToken, code) => {
    setError(null);
    const data = await candidateVerify2FA(pendingToken, code);
    if (data.user?.role !== 'candidate') {
      await logoutApi();
      const err = new Error('This portal is for candidate accounts only.');
      setError(err.message);
      throw err;
    }
    setUser(data.user);
    setIsAuthed(true);
    await refreshApplications();
    return data;
  };

  const logout = async () => {
    await logoutApi();
    setIsAuthed(false);
    setUser(null);
    setApplications([]);
  };

  const saveProfile = async (body) => {
    setError(null);
    const data = await updateProfile(body);
    const nextUser = data?.user || data;
    if (nextUser) setUser(nextUser);
    return data;
  };

  const withdraw = async (applicationId) => {
    setError(null);
    await withdrawApplication(applicationId);
    await refreshApplications();
  };

  return (
    <CandidateContext.Provider
      value={{
        isReady,
        isAuthed,
        user,
        applications,
        loading,
        error,
        login: beginLogin,
        register: beginRegister,
        completeLogin,
        logout,
        refreshApplications,
        saveProfile,
        withdraw,
      }}
    >
      {children}
    </CandidateContext.Provider>
  );
}

export function useCandidate() {
  const ctx = useContext(CandidateContext);
  if (!ctx) throw new Error('useCandidate must be used within CandidateProvider');
  return ctx;
}
