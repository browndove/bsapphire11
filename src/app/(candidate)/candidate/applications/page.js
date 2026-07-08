'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCandidate } from '../CandidateContext';
import { PortalStages } from '@/lib/job-api/mappers';
import PortalHeader from '@/app/(admin)/job-portal/components/PortalHeader';
import EmptyState from '@/app/(admin)/job-portal/components/EmptyState';
import { formatRelativeTime } from '@/lib/job-api/format';
import { toUserMessage } from '@/lib/job-api/errors';
import { useConfirm } from '@/components/ConfirmProvider';
import { candidateApplyPath } from '@/lib/job-api/candidate-routes';

const WITHDRAWABLE = new Set(['submitted', 'reviewing', 'shortlisted', 'interview']);

export default function CandidateApplications() {
  const router = useRouter();
  const confirm = useConfirm();
  const { isReady, isAuthed, applications, loading, error, withdraw } = useCandidate();
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (isReady && !isAuthed) {
      router.replace('/candidate/login');
    }
  }, [isReady, isAuthed, router]);

  if (!isReady || !isAuthed) return null;

  const handleWithdraw = async (app) => {
    const ok = await confirm({
      title: 'Withdraw application?',
      message: `Remove your application for ${app.jobTitle || 'this role'}? You can apply again later if the role is still open.`,
      confirmText: 'Withdraw',
      cancelText: 'Keep application',
      variant: 'danger',
    });
    if (!ok) return;
    setActionError('');
    try {
      await withdraw(app.id);
    } catch (err) {
      setActionError(toUserMessage(err));
    }
  };

  return (
    <>
      <PortalHeader
        title="My applications"
        badge={applications.length || null}
        action={
          <Link href="/careers" className="btn btn-outline btn-sm">
            Browse jobs
          </Link>
        }
      />

      {error ? <div className="ats-toast is-error">{error}</div> : null}
      {actionError ? <div className="ats-toast is-error">{actionError}</div> : null}

      {loading ? (
        <div className="ats-skeleton" />
      ) : applications.length === 0 ? (
        <EmptyState
          icon="applications"
          title="No applications yet"
          description="When you apply to a role, it will show up here with its current status."
          action={
            <Link href="/careers" className="btn btn-primary btn-sm">
              Browse open roles
            </Link>
          }
        />
      ) : (
        <div className="ats-table-shell">
          <div className="ats-table-wrap">
            <table className="ats-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const tagClass = PortalStages.tagClassByStatus[app.status] || 'tag-stage-new';
                  const tagLabel = PortalStages.labels[app.status] || app.status;
                  const canWithdraw = WITHDRAWABLE.has(app.status);
                  const canReapply = app.status === 'withdrawn' && app.jobId;
                  return (
                    <tr key={app.id}>
                      <td><strong>{app.jobTitle || 'Role'}</strong></td>
                      <td><span className={`tag ${tagClass}`}>{tagLabel}</span></td>
                      <td className="ats-table-sub">{formatRelativeTime(app.submittedAt)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {app.jobId ? (
                            <Link href={candidateApplyPath(app.jobId)} className="btn btn-outline btn-sm">
                              {canReapply ? 'Reapply' : 'View role'}
                            </Link>
                          ) : null}
                          {canWithdraw ? (
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => handleWithdraw(app)}>
                              Withdraw
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
