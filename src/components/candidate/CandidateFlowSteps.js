'use client';

const STEPS = [
  { id: 1, label: 'Create account' },
  { id: 2, label: 'Set up 2FA' },
  { id: 3, label: 'Apply & track' },
];

export default function CandidateFlowSteps({ currentStep = 1 }) {
  return (
    <div className="candidate-flow-steps" aria-label="Candidate onboarding progress">
      {STEPS.map((step, index) => {
        const isComplete = currentStep > step.id;
        const isActive = currentStep === step.id;
        const lineFilled = currentStep >= step.id;
        const stepClass = [
          'candidate-flow-step',
          isComplete ? 'is-complete' : '',
          isActive ? 'is-active' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div key={step.id} className="candidate-flow-segment">
            {index > 0 ? (
              <div
                className={`candidate-flow-line ${lineFilled ? 'is-filled' : ''}`}
                aria-hidden="true"
              />
            ) : null}
            <div className={stepClass}>
              <span className="candidate-flow-step-mark" aria-hidden="true">
                {isComplete ? '✓' : step.id}
              </span>
              <span className="candidate-flow-step-label">{step.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
