'use client';

import { PortalIcon } from './PortalIcons';

export default function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="ats-empty">
      <div className="ats-empty-icon-wrap">
        <PortalIcon name={icon} className="ats-icon ats-icon-lg" />
      </div>
      <h3>{title}</h3>
      {description ? <p className="hint">{description}</p> : null}
      {action ? <div className="ats-empty-action">{action}</div> : null}
    </div>
  );
}
