/** Phase 1 Fever handoff steps — mirrors Gaerten ForcedStepper PLAN_STEPS. */

export type HandoffStepId = 'package' | 'addons';

export type HandoffStep = {
  id: HandoffStepId;
  title: string;
};

export const HANDOFF_STEPS: HandoffStep[] = [
  { id: 'package', title: 'Package' },
  { id: 'addons', title: 'Add-ons' },
];

export const DEFAULT_HANDOFF_STEP: HandoffStepId = 'package';

export function getHandoffStepIndex(id: HandoffStepId): number {
  const index = HANDOFF_STEPS.findIndex((step) => step.id === id);
  return index >= 0 ? index : 0;
}

export function getHandoffStepFromHash(hash: string): HandoffStepId {
  const id = hash.replace(/^#/, '');
  if (id === 'addons') return 'addons';
  // Legacy #session → package
  return 'package';
}
