'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortal } from '../../PortalContext';
import { DEFAULT_JOB_CURRENCY, EMPLOYMENT_TYPES, JOB_CURRENCIES, JOB_CURRENCY_SYMBOL, JOB_STATUSES, REMOTE_TYPES } from '@/lib/job-api/config';
import { formatEmploymentType, formatRemoteType } from '@/lib/job-api/mappers';
import { toUserMessage } from '@/lib/job-api/errors';
import PortalHeader, { BreadcrumbLink } from '../../components/PortalHeader';
import PageTabs from '../../components/PageTabs';
import StickyFormBar from '../../components/StickyFormBar';
import ScreeningQuestionsEditor from '../../components/ScreeningQuestionsEditor';
import CustomSelect from '@/components/CustomSelect';
import { useConfirm } from '@/components/ConfirmProvider';

const SECTIONS = [
  { id: 'details', label: 'Details' },
  { id: 'compensation', label: 'Compensation' },
  { id: 'description', label: 'Description' },
  { id: 'application', label: 'Application form' },
  { id: 'publish', label: 'Publish' },
];

const emptyJob = {
  id: '',
  title: '',
  department: '',
  location: '',
  status: 'draft',
  description: '',
  requirements: '',
  remoteType: 'remote',
  employmentType: 'full_time',
  salaryMin: '',
  salaryMax: '',
  currency: DEFAULT_JOB_CURRENCY,
  categoryId: '',
  screeningQuestions: [],
};

function PostingEditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { isReady, isAuthed, categories, loadJobById, upsertJob, removeJob } = usePortal();
  const confirm = useConfirm();

  const [job, setJob] = useState(emptyJob);
  const [section, setSection] = useState('details');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [loadingJob, setLoadingJob] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace('/job-portal/login');
      return;
    }
    if (isReady && isAuthed && id && job.id !== id) {
      setLoadingJob(true);
      loadJobById(id)
        .then((existing) => setJob({ ...emptyJob, ...existing, screeningQuestions: existing.screeningQuestions || [] }))
        .catch((err) => setError(toUserMessage(err)))
        .finally(() => setLoadingJob(false));
    }
  }, [isReady, isAuthed, id, job.id, router, loadJobById]);

  if (!isReady || !isAuthed) return null;

  const updateField = (field, value) => {
    setJob((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setError('');
    if (!job.title?.trim()) {
      setError('Job title is required.');
      setSection('details');
      return;
    }
    if (!job.description?.trim()) {
      setError('Description is required before you can save or publish.');
      setSection('description');
      return;
    }
    if (!id && job.status === 'closed') {
      setError('Save the job as draft or published first. You can close it after it exists.');
      setSection('publish');
      return;
    }

    setSaving(true);
    try {
      const saved = await upsertJob(job);
      setJob({ ...emptyJob, ...saved, screeningQuestions: saved.screeningQuestions || [] });
      setToast('Saved successfully!');
      setTimeout(() => setToast(''), 3000);
      if (!id) {
        router.replace(`/job-portal/postings/edit?id=${encodeURIComponent(saved.id)}`);
      }
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const ok = await confirm({
      title: 'Delete job posting?',
      message: `"${job.title || 'This job'}" will be permanently removed.`,
      confirmText: 'Delete job',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;

    setDeleting(true);
    setError('');
    try {
      await removeJob(id);
      router.push('/job-portal/postings');
    } catch (err) {
      setError(toUserMessage(err, 'job'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PortalHeader
        breadcrumb={
          <>
            <BreadcrumbLink href="/job-portal/postings">Jobs</BreadcrumbLink>
            <span aria-hidden="true"> / </span>
            <span>{id ? 'Edit job' : 'New job'}</span>
          </>
        }
        title={id ? 'Edit job' : 'New job'}
      />

      {loadingJob ? <div className="ats-skeleton" /> : null}

      <PageTabs tabs={SECTIONS} active={section} onChange={setSection} />

      <form
        id="job-form"
        className="ats-panel ats-form"
        style={{ marginTop: '1.25rem', paddingBottom: '5rem' }}
        onSubmit={(e) => e.preventDefault()}
      >
        {section === 'details' ? (
          <div className="ats-form-grid cols-2">
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="field-title">Job title</label>
              <input
                type="text"
                id="field-title"
                required
                maxLength="140"
                placeholder="e.g. Backend Engineer"
                value={job.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="field-category">Category</label>
              <CustomSelect
                id="field-category"
                value={job.categoryId || ''}
                onChange={(v) => updateField('categoryId', v)}
                placeholder="Uncategorized"
                options={[
                  { value: '', label: 'Uncategorized' },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="field-location">Location</label>
              <input
                type="text"
                id="field-location"
                placeholder="Remote, Accra hybrid, …"
                value={job.location}
                onChange={(e) => updateField('location', e.target.value)}
              />
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="field-remote">Remote type</label>
              <CustomSelect
                id="field-remote"
                value={job.remoteType}
                onChange={(v) => updateField('remoteType', v)}
                options={REMOTE_TYPES.map((s) => ({ value: s, label: formatRemoteType(s) }))}
              />
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="field-employment">Employment type</label>
              <CustomSelect
                id="field-employment"
                value={job.employmentType}
                onChange={(v) => updateField('employmentType', v)}
                options={EMPLOYMENT_TYPES.map((s) => ({ value: s, label: formatEmploymentType(s) }))}
              />
            </div>
          </div>
        ) : null}

        {section === 'compensation' ? (
          <div className="ats-form-grid cols-3">
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="field-salary-min">Salary min</label>
              <div className="ats-input-prefix-wrap">
                <span className="ats-input-prefix" aria-hidden="true">{JOB_CURRENCY_SYMBOL}</span>
                <input
                  type="number"
                  id="field-salary-min"
                  placeholder="5000"
                  value={job.salaryMin ?? ''}
                  onChange={(e) => updateField('salaryMin', e.target.value)}
                />
              </div>
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="field-salary-max">Salary max</label>
              <div className="ats-input-prefix-wrap">
                <span className="ats-input-prefix" aria-hidden="true">{JOB_CURRENCY_SYMBOL}</span>
                <input
                  type="number"
                  id="field-salary-max"
                  placeholder="12000"
                  value={job.salaryMax ?? ''}
                  onChange={(e) => updateField('salaryMax', e.target.value)}
                />
              </div>
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="field-currency">Currency</label>
              <CustomSelect
                id="field-currency"
                value={job.currency || DEFAULT_JOB_CURRENCY}
                onChange={(v) => updateField('currency', v)}
                options={JOB_CURRENCIES}
              />
              <p className="ats-field-hint">Salaries are stored in Ghana Cedis ({JOB_CURRENCY_SYMBOL}).</p>
            </div>
          </div>
        ) : null}

        {section === 'description' ? (
          <>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="field-desc">Description</label>
              <textarea
                id="field-desc"
                placeholder="Role overview shown on the public job page"
                value={job.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="field-req">Requirements</label>
              <textarea
                id="field-req"
                placeholder="Skills, experience, and qualifications"
                value={job.requirements}
                onChange={(e) => updateField('requirements', e.target.value)}
              />
            </div>
          </>
        ) : null}

        {section === 'application' ? (
          <ScreeningQuestionsEditor
            questions={job.screeningQuestions || []}
            onChange={(screeningQuestions) => updateField('screeningQuestions', screeningQuestions)}
          />
        ) : null}

        {section === 'publish' ? (
          <div className="ats-form-grid cols-2">
            <div className="ats-field">
              <label className="ats-field-label" htmlFor="field-status">Status</label>
              <CustomSelect
                id="field-status"
                value={job.status}
                onChange={(v) => updateField('status', v)}
                options={JOB_STATUSES.filter((s) => s !== 'archived').map((s) => ({
                  value: s,
                  label: s.charAt(0).toUpperCase() + s.slice(1),
                }))}
              />
              <p className="ats-field-hint">Published roles appear on the public careers site.</p>
            </div>
          </div>
        ) : null}
      </form>

      <StickyFormBar
        status={job.status}
        saving={saving}
        deleting={deleting}
        onSave={handleSave}
        onDelete={id ? handleDelete : undefined}
        cancelHref="/job-portal/postings"
        toast={toast}
        error={error}
      />
    </>
  );
}

export default function PostingEdit() {
  return (
    <Suspense fallback={<div className="ats-skeleton" />}>
      <PostingEditForm />
    </Suspense>
  );
}
