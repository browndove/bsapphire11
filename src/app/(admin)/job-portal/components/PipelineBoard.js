'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from './Avatar';
import { formatRelativeTime } from '@/lib/job-api/format';
import { PortalStages } from '../PortalContext';

const SHORTLISTABLE = new Set(['submitted', 'reviewing']);

function notifyAction(status) {
  if (status === 'interview') return { label: 'Send invite', primary: true };
  if (status === 'hired') return { label: 'Send offer', primary: false };
  if (status === 'withdrawn') return null;
  return { label: 'Email', primary: false };
}

function CandidateCard({
  app,
  jobTitle,
  dragging,
  onDragStart,
  onDragEnd,
  onShortlist,
  onBeforeOpen,
  onTouchStart,
}) {
  const router = useRouter();
  const cardRef = useRef(null);
  const [shortlisting, setShortlisting] = useState(false);
  const canShortlist = SHORTLISTABLE.has(app.status);
  const notify = app.email ? notifyAction(app.status) : null;

  const openNotify = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const params = new URLSearchParams({ id: app.id, notify: '1' });
    if (app.jobId) params.set('job', app.jobId);
    router.push(`/job-portal/applications/detail?${params.toString()}`);
  };

  const armDrag = (e) => {
    if (e.target.closest('button')) return;
    if (e.button === 0 && cardRef.current) cardRef.current.draggable = true;
  };

  const disarmDrag = () => {
    if (cardRef.current) cardRef.current.draggable = false;
  };

  const openDetail = () => {
    onBeforeOpen?.(app);
    const params = new URLSearchParams({ id: app.id });
    if (app.jobId) params.set('job', app.jobId);
    router.push(`/job-portal/applications/detail?${params.toString()}`);
  };

  return (
    <div
      ref={cardRef}
      className={`ats-candidate-card${dragging ? ' is-dragging' : ''}`}
      draggable={false}
      onPointerDown={(event) => {
        armDrag(event);
        if (event.pointerType !== 'mouse') onTouchStart?.(event, app);
      }}
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
      {notify || (canShortlist && onShortlist) ? (
        <div className="ats-candidate-card-actions">
          {notify ? (
            <button
              type="button"
              className={`btn btn-sm ${notify.primary ? 'btn-primary' : 'btn-outline'}`}
              onClick={openNotify}
            >
              {notify.label}
            </button>
          ) : null}
          {canShortlist && onShortlist ? (
            <button
              type="button"
              className="btn btn-outline btn-sm"
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
          ) : null}
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
  onBeforeOpen,
  onTouchStart,
}) {
  return (
    <div className={`ats-kanban-col ats-kanban-col--${stage}`} data-stage={stage}>
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
              onBeforeOpen={onBeforeOpen}
              onTouchStart={onTouchStart}
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
  onBeforeOpen,
}) {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const scrollerRef = useRef(null);
  const touchDrag = useRef(null);

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

  const autoScroll = (clientX) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const rect = scroller.getBoundingClientRect();
    if (clientX > rect.right - 64) scroller.scrollLeft += 18;
    if (clientX < rect.left + 64) scroller.scrollLeft -= 18;
  };

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
      autoScroll(e.clientX);
      setDragOverCol(stage);
    },
    onBeforeOpen,
    onTouchStart: (event, app) => {
      touchDrag.current = { id: app.id };
      setDraggingId(app.id);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    onDragLeave: () => setDragOverCol(null),
    onDrop: (e) => handleDrop(e, stage),
    onShortlist,
  });

  const finishTouch = async (event) => {
    if (!touchDrag.current) return;
    const appId = touchDrag.current.id;
    touchDrag.current = null;
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const stage = target?.closest('[data-stage]')?.getAttribute('data-stage');
    setDraggingId(null);
    setDragOverCol(null);
    if (!stage) return;
    try {
      await onMoveApplication(appId, stage);
    } catch (err) {
      onError?.(err);
    }
  };

  return (
    <div
      className={`ats-kanban${stages.length === 1 ? ' is-focused' : ''}${
        pinnedStage ? ' has-pinned' : ''
      }`}
      onPointerMove={(event) => {
        if (!touchDrag.current) return;
        autoScroll(event.clientX);
        const target = document.elementFromPoint(event.clientX, event.clientY);
        setDragOverCol(target?.closest('[data-stage]')?.getAttribute('data-stage') || null);
      }}
      onPointerUp={finishTouch}
      onPointerCancel={() => {
        touchDrag.current = null;
        setDraggingId(null);
        setDragOverCol(null);
      }}
    >
      {pinnedStage ? (
        <div className="ats-kanban-pinned">
          <StageColumn {...colProps(pinnedStage)} />
        </div>
      ) : null}
      <div className="ats-kanban-scroll" ref={scrollerRef}>
        {scrollStages.map((stage) => (
          <StageColumn key={stage} {...colProps(stage)} />
        ))}
      </div>
    </div>
  );
}
