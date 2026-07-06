'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePortal } from '../PortalContext';
import PortalHeader from '../components/PortalHeader';
import PageTabs from '../components/PageTabs';
import JobTable from '../components/JobTable';
import EmptyState from '../components/EmptyState';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Draft' },
  { id: 'closed', label: 'Closed' },
];

export default function Postings() {
  const router = useRouter();
  const { isReady, isAuthed, jobs, getApplicantCount, loading } = usePortal();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace('/job-portal/login');
    }
  }, [isReady, isAuthed, router]);

  const tabCounts = useMemo(() => {
    const counts = { all: jobs.length, published: 0, draft: 0, closed: 0 };
    jobs.forEach((j) => {
      if (j.status === 'published') counts.published += 1;
      else if (j.status === 'draft') counts.draft += 1;
      else counts.closed += 1;
    });
    return counts;
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let list = jobs;
    if (activeTab !== 'all') {
      list = list.filter((j) => j.status === activeTab);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (j) =>
          (j.title || '').toLowerCase().includes(q) ||
          (j.location || '').toLowerCase().includes(q) ||
          (j.department || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [jobs, activeTab, search]);

  if (!isReady || !isAuthed) return null;

  const tabs = TABS.map((t) => ({ ...t, count: tabCounts[t.id] }));

  const emptyCopy = {
    all: { title: 'No jobs yet', description: 'Create your first job posting to start hiring.' },
    published: { title: 'No published jobs', description: 'Publish a draft job to make it live on your careers page.' },
    draft: { title: 'No drafts', description: 'Start a new job and save it as a draft.' },
    closed: { title: 'No closed jobs', description: 'Closed jobs will appear here.' },
  };

  return (
    <>
      <PortalHeader
        title="Jobs"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title or location…"
        action={
          <Link href="/job-portal/postings/edit" className="btn btn-primary">
            Post a job
          </Link>
        }
      />

      <PageTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {loading ? (
        <div className="ats-skeleton" style={{ marginTop: '1.25rem' }} />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon="briefcase"
          title={emptyCopy[activeTab].title}
          description={emptyCopy[activeTab].description}
          action={
            <Link href="/job-portal/postings/edit" className="btn btn-primary btn-sm">
              Post a job
            </Link>
          }
        />
      ) : (
        <JobTable jobs={filteredJobs} getApplicantCount={getApplicantCount} />
      )}
    </>
  );
}
