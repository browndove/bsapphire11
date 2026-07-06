'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from './Avatar';
import { formatRelativeTime } from '@/lib/job-api/format';
import { PortalStages } from '../PortalContext';

function CandidateCard({ app, jobTitle, onDragStart, onDragEnd }) {
  const router = useRouter();

  return (
    <div
      className="ats-candidate-card"
      draggable
      onDragStart={(e) => onDragStart(e, app)}
      onDragEnd={onDragEnd}
      onClick={() => router.push(`/job-portal/applications/detail?id=${encodeURIComponent(app.id)}`)}
    >
      <div className="ats-candidate-card-head">
        <Avatar name={app.candidateName} size="sm" />
        <div>
          <div className="ats-candidate-card-name">{app.candidateName}</div>
          <div className="ats-candidate-card-meta">{formatRelativeTime(app.submittedAt)}</div>
        </div>
      </div>
      <div className="ats-candidate-card-job">{jobTitle || '—'}</div>
    </div>
  );
}

export default function PipelineBoard({
  stages,
  applications,
  jobs,
  onMoveApplication,
  onError,
}) {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const appsByStatus = stages.reduce((acc, stage) => {
    acc[stage] = applications.filter((a) => a.status === stage);
    return acc;
  }, {});

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

  return (
    <div className={`ats-kanban ${stages.length === 1 ? 'is-focused' : ''}`}>
      {stages.map((stage) => {
        const colApps = appsByStatus[stage] || [];
        return (
          <div key={stage} className={`ats-kanban-col ats-kanban-col--${stage}`}>
            <div className="ats-kanban-col-header">
              <span className="ats-kanban-col-title">{PortalStages.labels[stage] || stage}</span>
              <span className="ats-kanban-col-count">{colApps.length}</span>
            </div>
            <div
              className={`ats-kanban-col-body ${dragOverCol === stage ? 'is-drag-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCol(stage);
              }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {colApps.map((app) => {
                const job = jobs.find((j) => j.id === app.jobId);
                return (
                  <div key={app.id} className={draggingId === app.id ? 'is-dragging' : ''}>
                    <CandidateCard
                      app={app}
                      jobTitle={job?.title || app.jobTitle}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
