import {
  HANDOFF_STEPS,
  type HandoffStepId,
} from '../data/handoffPlanSteps';
import './ForcedPlanProgress.css';

type ForcedPlanProgressProps = {
  activeStep: HandoffStepId;
};

/** Exact Gaerten ForcedStepper progress chrome — CMP package → add-ons. */
export function ForcedPlanProgress({ activeStep }: ForcedPlanProgressProps) {
  const total = HANDOFF_STEPS.length;
  const index = Math.max(
    0,
    HANDOFF_STEPS.findIndex((step) => step.id === activeStep),
  );
  const current = HANDOFF_STEPS[index] ?? HANDOFF_STEPS[0];
  const next = HANDOFF_STEPS[index + 1];
  const stepNumber = index + 1;
  const percent = (stepNumber / total) * 100;
  const statusLabel = next
    ? `Step ${stepNumber} of ${total}: ${current.title}. Up next: ${next.title}`
    : `Step ${stepNumber} of ${total}: ${current.title}. Last step`;

  return (
    <div className="forcedPlanProgress" role="status" aria-label={statusLabel}>
      <div className="forcedPlanProgressHead">
        <p className="forcedPlanProgressTitle" id={`plan-step-${current.id}`}>
          {current.title}
        </p>
        <p className="forcedPlanProgressCount">
          {stepNumber} of {total}
        </p>
      </div>
      {next ? (
        <p className="forcedPlanProgressNext">Up next: {next.title}</p>
      ) : (
        <p className="forcedPlanProgressNext">Last stop — then checkout</p>
      )}
      <div className="forcedPlanProgressTrack" aria-hidden="true">
        <div className="forcedPlanProgressFill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
