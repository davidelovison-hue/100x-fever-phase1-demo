import { HANDOFF_STEPS, type HandoffStepId } from '../data/handoffPlanSteps';
import { FeverNavTabs } from './FeverNavTabs';

type PlanTab = { id: HandoffStepId; title: string };

type PlanTabsProps = {
  activeTab: HandoffStepId;
  onTabChange: (tabId: HandoffStepId) => void;
  tabs?: PlanTab[];
};

/** Gaerten marketplace ticket-category tabs — CMP Package → Add-ons. */
export function PlanTabs({
  activeTab,
  onTabChange,
  tabs = HANDOFF_STEPS,
}: PlanTabsProps) {
  return (
    <FeverNavTabs
      ariaLabel="Ticket categories"
      variant="pill"
      tabs={tabs.map((tab) => ({ id: tab.id, label: tab.title }))}
      activeId={activeTab}
      onSelect={(id) => onTabChange(id as HandoffStepId)}
      getTabDomId={(id) => `plan-tab-${id}`}
    />
  );
}
