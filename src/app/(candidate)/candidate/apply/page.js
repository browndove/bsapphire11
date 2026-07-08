'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCandidate } from '../CandidateContext';
import { fetchPublicJob, submitApplication, uploadResume } from '@/lib/job-api/client';
import { candidateLoginForJob, getActiveApplicationForJob, getWithdrawnApplicationForJob } from '@/lib/job-api/candidate-routes';
import ResumeFilePicker from '@/components/candidate/ResumeFilePicker';
import ScreeningAnswersForm from '@/components/candidate/ScreeningAnswersForm';
import { formatEmploymentType, formatRemoteType, mapApplicationSubmitToApi, mapPublicJobFromApi } from '@/lib/job-api/mappers';
import { getFieldErrors, toUserMessage } from '@/lib/job-api/errors';
import PortalHeader, { BreadcrumbLink } from '@/app/(admin)/job-portal/components/PortalHeader';

function CandidateApplyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const { isReady, isAuthed, applications, refreshApplications } = useCandidate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const [applyError, setApplyError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [screeningAnswers, setScreeningAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthed) {
      router.replace(jobId ? candidateLoginForJob(jobId) : '/candidate/login');
    }
  }, [isReady, isAuthed, jobId, router]);

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

  if (!isReady || !isAuthed) return null;

  const activeApplication = getActiveApplicationForJob(applications, jobId);
  const withdrawnApplication = getWithdrawnApplicationForJob(applications, jobId);

  const handleResumeChange = (file, validationError = '') => {
    setResumeFile(file);
    setResumeError(validationError);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!job) return;
    if (!resumeFile) {
      setResumeError('Please attach your resume.');
      return;
    }

    const questions = job.screeningQuestions || [];
    for (const q of questions) {
      const value = screeningAnswers[q.id];
      if (q.type === 'multi') {
        if (!Array.isArray(value) || !value.length) {
          setApplyError(`Please answer: ${q.label}`);
          return;
        }
      } else if (!value || !String(value).trim()) {
        setApplyError(`Please answer: ${q.label}`);
        return;
      }
    }

    setSubmitting(true);
    setApplyError('');
    setFieldErrors({});
    setResumeError('');
    try {
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
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setApplyError(toUserMessage(err, 'apply'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PortalHeader
        title={job?.title || 'Apply for role'}
        breadcrumbs={
          <>
            <BreadcrumbLink href="/careers">Careers</BreadcrumbLink>
            <span aria-hidden="true">/</span>
            <span>Apply</span>
          </>
        }
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
              <span className="tag">{job.department || formatEmploymentType(job.employmentType)}</span>
              <span className="tag">{formatRemoteType(job.remoteType)}</span>
              <span className="tag">{job.location || 'Location flexible'}</span>
            </div>
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
                <p className="hint" style={{ marginBottom: '1rem' }}>
                  You already have an active application for this role. Track its status in your applications inbox.
                </p>
                <Link href="/candidate/applications" className="btn btn-primary btn-sm">
                  View my applications
                </Link>
              </div>
            ) : (
              <form className="ats-form" onSubmit={handleApply}>
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
