'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from './Avatar';
import { formatRelativeTime } from '@/lib/job-api/format';
import { PortalStages } from '../PortalContext';

const SHORTLISTABLE = new Set(['submitted', 'reviewing', 'interview']);

function CandidateCard({
  app,
  jobTitle,
  dragging,
  onDragStart,
  onDragEnd,
  onShortlist,
}) {
  const router = useRouter();
  const cardRef = useRef(null);
  const [shortlisting, setShortlisting] = useState(false);
  const canShortlist = SHORTLISTABLE.has(app.status);

  const armDrag = (e) => {
    if (e.button === 0 && cardRef.current) cardRef.current.draggable = true;
  };

  const disarmDrag = () => {
    if (cardRef.current) cardRef.current.draggable = false;
  };

  const openDetail = () => {
    const params = new URLSearchParams({ id: app.id });
    if (app.jobId) params.set('job', app.jobId);
    router.push(`/job-portal/applications/detail?${params.toString()}`);
  };

  return (
    <div
      ref={cardRef}
      className={`ats-candidate-card${dragging ? ' is-dragging' : ''}`}
      draggable={false}
      onPointerDown={armDrag}
      onPointerUp={disarmDrag}
      onPointerCancel={disarmDrag}
      onDragStart={(e) => onDragStart(e, app)}
      onDragEnd={() => {
        disarmDrag();
        onDragEnd();
      }}
      onClick={openDetail}
    >
      <div className="ats-candidate-card-head">
        <Avatar name={app.candidateName} size="sm" />
        <div>
          <div className="ats-candidate-card-name">{app.candidateName}</div>
          <div className="ats-candidate-card-meta">
            {app.status === 'shortlisted' && app.shortlistedAt
              ? `Shortlisted ${formatRelativeTime(app.shortlistedAt)}`
              : formatRelativeTime(app.submittedAt)}
          </div>
        </div>
      </div>
      <div className="ats-candidate-card-job">{jobTitle || '—'}</div>
      {canShortlist && onShortlist ? (
        <div className="ats-candidate-card-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm ats-candidate-card-shortlist"
            disabled={shortlisting}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              setShortlisting(true);
              try {
                await onShortlist(app.id);
              } finally {
                setShortlisting(false);
              }
            }}
          >
            {shortlisting ? 'Saving…' : 'Shortlist'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function StageColumn({
  stage,
  apps,
  jobsById,
  draggingId,
  dragOverCol,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onShortlist,
}) {
  return (
    <div className={`ats-kanban-col ats-kanban-col--${stage}`}>
      <div className="ats-kanban-col-header">
        <span className="ats-kanban-col-title">{PortalStages.labels[stage] || stage}</span>
        <span className="ats-kanban-col-count">{apps.length}</span>
      </div>
      <div
        className={`ats-kanban-col-body ${dragOverCol === stage ? 'is-drag-over' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {apps.map((app) => {
          const job = jobsById.get(app.jobId);
          return (
            <CandidateCard
              key={app.id}
              app={app}
              jobTitle={job?.title || app.jobTitle}
              dragging={draggingId === app.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onShortlist={onShortlist}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function PipelineBoard({
  stages,
  applications,
  jobs,
  onMoveApplication,
  onShortlist,
  onError,
}) {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const jobsById = useMemo(() => {
    const map = new Map();
    for (const job of jobs || []) {
      if (job?.id) map.set(job.id, job);
    }
    return map;
  }, [jobs]);

  const appsByStatus = useMemo(() => {
    const acc = {};
    for (const stage of stages) acc[stage] = [];
    for (const app of applications) {
      if (!acc[app.status]) acc[app.status] = [];
      acc[app.status].push(app);
    }
    return acc;
  }, [stages, applications]);

  const pinSubmitted = stages.length > 1 && stages[0] === 'submitted';
  const pinnedStage = pinSubmitted ? 'submitted' : null;
  const scrollStages = pinnedStage ? stages.slice(1) : stages;

  const handleDragStart = (e, app) => {
    setDraggingId(app.id);
    e.dataTransfer.setData('application/id', app.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const appId = e.dataTransfer.getData('application/id');
    const app = applications.find((a) => a.id === appId);
    if (!app || app.status === newStatus) return;

    try {
      await onMoveApplication(appId, newStatus);
    } catch (err) {
      onError?.(err);
    }
  };

  const colProps = (stage) => ({
    stage,
    apps: appsByStatus[stage] || [],
    jobsById,
    draggingId,
    dragOverCol,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDragOver: (e) => {
      e.preventDefault();
      setDragOverCol(stage);
    },
    onDragLeave: () => setDragOverCol(null),
    onDrop: (e) => handleDrop(e, stage),
    onShortlist,
  });

  return (
    <div
      className={`ats-kanban${stages.length === 1 ? ' is-focused' : ''}${
        pinnedStage ? ' has-pinned' : ''
      }`}
    >
      {pinnedStage ? (
        <div className="ats-kanban-pinned">
          <StageColumn {...colProps(pinnedStage)} />
        </div>
      ) : null}
      <div className="ats-kanban-scroll">
        {scrollStages.map((stage) => (
          <StageColumn key={stage} {...colProps(stage)} />
        ))}
      </div>
    </div>
  );
}
