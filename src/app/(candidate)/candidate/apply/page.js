'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCandidate } from '../CandidateContext';
import {
  fetchPublicJob,
  submitApplication,
  submitGuestApplication,
  uploadResume,
  uploadResumePublic,
} from '@/lib/job-api/client';
import { getActiveApplicationForJob, getWithdrawnApplicationForJob } from '@/lib/job-api/candidate-routes';
import ResumeFilePicker from '@/components/candidate/ResumeFilePicker';
import ScreeningAnswersForm from '@/components/candidate/ScreeningAnswersForm';
import ApplyContactFields from '@/components/candidate/ApplyContactFields';
import {
  formatEmploymentType,
  formatRemoteType,
  formatSalaryRange,
  mapApplicationSubmitToApi,
  mapGuestApplicationSubmitToApi,
  mapPublicJobFromApi,
  PortalStages,
  formatAnswerValue,
} from '@/lib/job-api/mappers';
import { getFieldErrors, toUserMessage } from '@/lib/job-api/errors';
import { formatRelativeTime } from '@/lib/job-api/format';
import PortalHeader, { BreadcrumbLink } from '@/app/(admin)/job-portal/components/PortalHeader';

function validateScreeningAnswers(questions, answers) {
  for (const q of questions) {
    const value = answers[q.id];
    if (q.type === 'multi') {
      if (!Array.isArray(value) || !value.length) {
        return `Please answer: ${q.label}`;
      }
    } else if (!value || !String(value).trim()) {
      return `Please answer: ${q.label}`;
    }
  }
  return '';
}

function CandidateApplyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const { isReady, isAuthed, applications, refreshApplications } = useCandidate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const [applyError, setApplyError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [screeningAnswers, setScreeningAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      setError('No role selected.');
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchPublicJob(jobId);
        if (!cancelled) setJob(mapPublicJobFromApi(data));
      } catch (err) {
        if (!cancelled) setError(toUserMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const activeApplication =
    isReady && isAuthed ? getActiveApplicationForJob(applications, jobId) : null;
  const withdrawnApplication =
    isReady && isAuthed ? getWithdrawnApplicationForJob(applications, jobId) : null;

  const activeStatusClass = activeApplication
    ? PortalStages.tagClassByStatus[activeApplication.status] || 'tag-stage-new'
    : '';
  const activeStatusLabel = activeApplication
    ? PortalStages.labels[activeApplication.status] || activeApplication.status
    : '';
  const submittedAnswerEntries = activeApplication
    ? (job?.screeningQuestions || []).length
      ? (job.screeningQuestions || []).map((q) => ({
          id: q.id,
          label: q.label,
          value: formatAnswerValue(activeApplication.answers?.[q.id]),
        }))
      : Object.entries(activeApplication.answers || {}).map(([id, value]) => ({
          id,
          label: id,
          value: formatAnswerValue(value),
        }))
    : [];

  const handleResumeChange = (file, validationError = '') => {
    setResumeFile(file);
    setResumeError(validationError);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!job) return;

    if (!isAuthed && (!firstName.trim() || !lastName.trim() || !email.trim())) {
      setApplyError('Please enter your name and email.');
      return;
    }

    if (!resumeFile) {
      setResumeError('Please attach your resume.');
      return;
    }

    const screeningError = validateScreeningAnswers(job.screeningQuestions || [], screeningAnswers);
    if (screeningError) {
      setApplyError(screeningError);
      return;
    }

    setSubmitting(true);
    setApplyError('');
    setFieldErrors({});
    setResumeError('');

    try {
      if (isAuthed) {
        const uploaded = await uploadResume(resumeFile);
        await submitApplication(
          mapApplicationSubmitToApi({
            jobId: job.id,
            coverLetter,
            resumeUrl: uploaded.file_url || uploaded.url,
            answers: screeningAnswers,
          })
        );
        await refreshApplications();
        router.push('/candidate/applications');
        return;
      }

      const uploaded = await uploadResumePublic(resumeFile);
      await submitGuestApplication(
        job.id,
        mapGuestApplicationSubmitToApi({
          firstName,
          lastName,
          email,
          phone,
          coverLetter,
          resumeUrl: uploaded.file_url || uploaded.url,
          answers: screeningAnswers,
        })
      );
      router.push('/success-job');
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setApplyError(toUserMessage(err, isAuthed ? 'apply' : 'guest-apply'));
    } finally {
      setSubmitting(false);
    }
  };

  const compensation = job ? formatSalaryRange(job) : '';

  return (
    <>
      <PortalHeader
        breadcrumb={
          <>
            <BreadcrumbLink href="/careers">Careers</BreadcrumbLink>
            <span aria-hidden="true"> / </span>
            <span>Apply</span>
          </>
        }
        title={job?.title || 'Apply for role'}
        action={
          <Link href="/careers" className="btn btn-outline btn-sm">
            Back to roles
          </Link>
        }
      />

      {loading ? (
        <div className="ats-skeleton" />
      ) : error || !job ? (
        <div className="ats-panel">
          <p className="hint">{error || 'Role not found.'}</p>
          <Link href="/careers" className="btn btn-outline btn-sm">Browse open roles</Link>
        </div>
      ) : (
        <div className="ats-detail-grid">
          <section className="ats-panel">
            <div className="ats-panel-head">
              <h2 className="ats-panel-title">Role details</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {job.department ? <span className="tag">{job.department}</span> : null}
              <span className="tag">{formatEmploymentType(job.employmentType)}</span>
              <span className="tag">{formatRemoteType(job.remoteType)}</span>
              <span className="tag">{job.location || 'Location flexible'}</span>
            </div>
            {compensation ? (
              <div className="ats-material-block" style={{ marginBottom: '1.25rem' }}>
                <p className="ats-material-label">Compensation</p>
                <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-color)' }}>
                  {compensation}
                  <span className="ats-table-sub" style={{ marginLeft: '0.5rem' }}>
                    Ghana Cedis (GHS)
                  </span>
                </p>
              </div>
            ) : null}
            {job.description ? (
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--text-muted)' }}>{job.description}</div>
            ) : null}
            {job.requirements ? (
              <>
                <h3 className="ats-panel-title" style={{ marginTop: '1.5rem' }}>Requirements</h3>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--text-muted)' }}>{job.requirements}</div>
              </>
            ) : null}
          </section>

          <section className="ats-panel">
            <div className="ats-panel-head">
              <h2 className="ats-panel-title">Your application</h2>
            </div>

            {activeApplication ? (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span className={`tag ${activeStatusClass}`}>{activeStatusLabel}</span>
                  {activeApplication.submittedAt ? (
                    <span className="ats-table-sub">
                      Submitted {formatRelativeTime(activeApplication.submittedAt)}
                    </span>
                  ) : null}
                </div>
                <p className="hint" style={{ marginBottom: '1.25rem' }}>
                  You already applied for this role. Below is what you submitted.
                </p>

                <div className="ats-material-block">
                  <p className="ats-material-label">Cover letter</p>
                  {activeApplication.coverLetter ? (
                    <blockquote className="ats-prose-block">{activeApplication.coverLetter}</blockquote>
                  ) : (
                    <div className="ats-empty-card">No cover letter provided.</div>
                  )}
                </div>

                <div className="ats-material-block">
                  <p className="ats-material-label">Resume</p>
                  {activeApplication.resumeUrl ? (
                    <div className="ats-file-card">
                      <div className="ats-file-card-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8l-6-6Z" strokeLinejoin="round" />
                          <path d="M14 2v6h6" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="ats-file-card-body">
                        <strong>Resume attached</strong>
                        <span>PDF or document on file</span>
                      </div>
                      <a
                        href={activeApplication.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        View resume
                      </a>
                    </div>
                  ) : (
                    <div className="ats-empty-card">No resume uploaded.</div>
                  )}
                </div>

                {submittedAnswerEntries.length ? (
                  <div className="ats-material-block">
                    <p className="ats-material-label">Screening answers</p>
                    <div className="ats-answer-grid">
                      {submittedAnswerEntries.map((entry) => (
                        <article className="ats-answer-card" key={entry.id}>
                          <h4>{entry.label}</h4>
                          <p>{entry.value || '—'}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}

                <Link href="/candidate/applications" className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
                  All my applications
                </Link>
              </div>
            ) : (
              <form className="ats-form" onSubmit={handleApply}>
                {!isAuthed ? (
                  <ApplyContactFields
                    firstName={firstName}
                    lastName={lastName}
                    email={email}
                    phone={phone}
                    onFirstNameChange={setFirstName}
                    onLastNameChange={setLastName}
                    onEmailChange={setEmail}
                    onPhoneChange={setPhone}
                    disabled={submitting}
                    errors={fieldErrors}
                  />
                ) : null}

                {withdrawnApplication ? (
                  <div className="ats-toast" style={{ marginBottom: '1rem' }}>
                    You previously withdrew from this role. Submit a new application below.
                  </div>
                ) : null}

                <div className="ats-field">
                  <label className="ats-field-label" htmlFor="cover-letter">Cover letter</label>
                  <textarea
                    id="cover-letter"
                    rows={5}
                    required
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell us why you are a strong fit for this role."
                    disabled={submitting}
                  />
                </div>
                <div className="ats-field">
                  <label className="ats-field-label" htmlFor="resume-file">Resume</label>
                  <ResumeFilePicker
                    id="resume-file"
                    value={resumeFile}
                    onChange={handleResumeChange}
                    error={resumeError}
                    disabled={submitting}
                  />
                </div>
                <ScreeningAnswersForm
                  questions={job.screeningQuestions || []}
                  values={screeningAnswers}
                  onChange={setScreeningAnswers}
                  errors={fieldErrors}
                  disabled={submitting}
                />
                {applyError ? <div className="ats-toast is-error">{applyError}</div> : null}
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit application'}
                </button>
                {!isAuthed ? (
                  <p className="ats-field-hint">
                    No account required — submit your application in one step.
                  </p>
                ) : null}
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}

export default function CandidateApply() {
  return (
    <Suspense fallback={<div className="ats-skeleton" />}>
      <CandidateApplyInner />
    </Suspense>
  );
}
