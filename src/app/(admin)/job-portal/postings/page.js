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

function isClosedGroup(status) {
  return status === 'closed' || status === 'archived';
}

function jobTimestamp(job) {
  const value = job?.updatedAt || job?.publishedAt || job?.createdAt || 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function sortJobsLatestFirst(list) {
  return [...list].sort((a, b) => jobTimestamp(b) - jobTimestamp(a));
}

export default function Postings() {
  const router = useRouter();
  const {
    isReady,
    isAuthed,
    jobs,
    getApplicantCount,
    loading,
  } = usePortal();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace('/job-portal/login');
    }
  }, [isReady, isAuthed, router]);

  const tabCounts = useMemo(() => {
    const counts = { all: 0, published: 0, draft: 0, closed: 0 };
    jobs.forEach((j) => {
      if (j.status === 'published') counts.published += 1;
      else if (j.status === 'draft') counts.draft += 1;
      else if (j.status === 'closed') counts.closed += 1;

      if (j.status !== 'archived' || showArchived) counts.all += 1;
    });
    if (showArchived) {
      counts.closed += jobs.filter((j) => j.status === 'archived').length;
    }
    return counts;
  }, [jobs, showArchived]);

  const archivedCount = useMemo(
    () => jobs.filter((j) => j.status === 'archived').length,
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    let list = jobs;

    if (activeTab === 'closed') {
      list = list.filter((j) =>
        showArchived ? isClosedGroup(j.status) : j.status === 'closed'
      );
    } else if (activeTab === 'all') {
      if (!showArchived) list = list.filter((j) => j.status !== 'archived');
    } else {
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

    return sortJobsLatestFirst(list);
  }, [jobs, activeTab, search, showArchived]);

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

      <div className="ats-jobs-toolbar">
        <PageTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        {archivedCount > 0 && (activeTab === 'all' || activeTab === 'closed') ? (
          <button
            type="button"
            className="ats-jobs-archive-toggle"
            onClick={() => setShowArchived((value) => !value)}
          >
            {showArchived ? 'Hide archived' : `Show archived (${archivedCount})`}
          </button>
        ) : null}
      </div>

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
