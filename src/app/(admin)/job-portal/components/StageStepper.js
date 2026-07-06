'use client';

import { PortalStages } from '../PortalContext';

const STEPPER_STAGES = ['submitted', 'reviewing', 'shortlisted', 'interview', 'hired'];

export default function StageStepper({ currentStatus }) {
  const isRejected = currentStatus === 'rejected' || currentStatus === 'withdrawn';
  const currentIdx = STEPPER_STAGES.indexOf(currentStatus);

  return (
    <div className="ats-stepper">
      {STEPPER_STAGES.map((stage, idx) => {
        let className = 'ats-step';
        if (isRejected && stage !== 'hired') {
          className += currentStatus === 'rejected' && idx === Math.max(currentIdx, 0) ? ' is-rejected' : '';
        } else if (stage === currentStatus) {
          className += ' is-active';
        } else if (currentIdx >= 0 && idx < currentIdx) {
          className += ' is-complete';
        }
        return (
          <div key={stage} className={className}>
            {PortalStages.labels[stage] || stage}
          </div>
        );
      })}
    </div>
  );
}
