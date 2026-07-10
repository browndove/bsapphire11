'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import BgCanvas from '@/components/BgCanvas';
import { fetchPublicJobs, fetchPublicCompany } from '@/lib/job-api/client';
import { toUserMessage } from '@/lib/job-api/errors';
import { formatEmploymentType, formatRemoteType, getPaginatedItems, mapPublicJobFromApi } from '@/lib/job-api/mappers';
import { candidateApplyPath } from '@/lib/job-api/candidate-routes';

export default function CareersClient({ initialJobs, initialCategories, initialCompany, initialError = '' }) {
  const [filter, setFilter] = useState('all');
  const [jobs, setJobs] = useState(initialJobs);
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [company, setCompany] = useState(initialCompany);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      setLoading(true);
      setError('');
      try {
        const [jobsRes, categoriesRes, companyRes] = await Promise.all([
          fetchPublicJobs({ limit: 100, offset: 0 }),
          fetch(`/api/public/categories?_=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }).then((r) => r.json()),
          fetchPublicCompany().catch(() => null),
        ]);
        if (cancelled) return;

        const cats = getPaginatedItems(categoriesRes);
        const byId = Object.fromEntries(cats.map((c) => [c.id, c]));
        const list = getPaginatedItems(jobsRes)
          .filter((job) => job.status === 'published' || !job.status)
          .map((job) => mapPublicJobFromApi(job, byId))
          .filter(Boolean);

        setCategories(cats);
        setJobs(list);
        setCompany(companyRes?.data ?? companyRes ?? null);
      } catch (err) {
        if (!cancelled) setError(toUserMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const onRefresh = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    window.addEventListener('focus', onRefresh);
    document.addEventListener('visibilitychange', onRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onRefresh);
      document.removeEventListener('visibilitychange', onRefresh);
    };
  }, []);

  const departments = useMemo(() => {
    const names = [...new Set(jobs.map((j) => j.department).filter(Boolean))];
    return names.sort();
  }, [jobs]);

  const filteredJobs = filter === 'all' ? jobs : jobs.filter((job) => job.department === filter);

  function jobApplyHref(jobId) {
    return candidateApplyPath(jobId);
  }

  return (
    <>
      <BgCanvas />
      <main>
        <header className="section" style={{ paddingTop: '150px', paddingBottom: '50px' }}>
          <div className="container text-center">
            <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
              Open roles at {company?.name || 'Blvck Sapphire'}
            </h1>
            <p className="hero-desc" style={{ maxWidth: '600px', margin: '0 auto' }}>
              {company?.description || "Join the architects of infinite scale. We're looking for visionary thinkers to build the resilient automation layers of tomorrow."}
            </p>
          </div>
        </header>

        <section className="section" style={{ paddingTop: '0' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            {error ? <p className="hint" style={{ marginBottom: '1.5rem', color: '#f87171' }}>{error}</p> : null}
            {loading ? <p className="hint">Refreshing open roles…</p> : null}

            <div className="careers-filter">
              <button type="button" className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All roles</button>
              {departments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  className={`filter-btn ${filter === dept ? 'active' : ''}`}
                  onClick={() => setFilter(dept)}
                >
                  {dept}
                </button>
              ))}
            </div>

            <div className="job-list">
              {!loading && filteredJobs.length === 0 ? (
                <p className="hint">No published roles right now. Check back soon.</p>
              ) : (
                filteredJobs.map((job) => (
                  <Link href={jobApplyHref(job.id)} key={job.id} className="job-tray">
                    <div className="job-tray-info">
                      <span className="job-dept">{job.department || formatEmploymentType(job.employmentType)}</span>
                      <h3 className="job-title-text">{job.title}</h3>
                      <span className="job-location">
                        {job.location || 'Location flexible'} · {formatRemoteType(job.remoteType)}
                      </span>
                    </div>
                    <div className="job-tray-arrow">&#8594;</div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
