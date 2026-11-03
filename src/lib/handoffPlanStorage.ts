/** Persist package → add-ons step selections across Fever plan routes. */

import { DEMO_PACKAGE_ID } from './packages';

const KEY = 'cmp:handoff-plan';

export type HandoffPlanSlice = {
  packageId: string;
  qty: number;
  /** Addon id → quantity (Gaerten cart-style). */
  addonQty: Record<string, number>;
};

export function persistHandoffPlan(slice: HandoffPlanSlice): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(slice));
  } catch {
    /* ignore */
  }
}

/** Reset qty to 1 and clear add-ons (e.g. returning to the 100x site). */
export function resetHandoffPlanSelection(packageId?: string): void {
  const current = readHandoffPlan();
  persistHandoffPlan({
    packageId: packageId ?? current.packageId,
    qty: 1,
    addonQty: {},
  });
}

function normalizeAddonQty(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, number> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'number' && value > 0) out[id] = Math.floor(value);
  }
  return out;
}

export function readHandoffPlan(): HandoffPlanSlice {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) {
      return { packageId: DEMO_PACKAGE_ID, qty: 1, addonQty: {} };
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { packageId: DEMO_PACKAGE_ID, qty: 1, addonQty: {} };
    }
    const o = parsed as Record<string, unknown>;
    // Migrate legacy addonIds: string[]
    let addonQty = normalizeAddonQty(o.addonQty);
    if (Object.keys(addonQty).length === 0 && Array.isArray(o.addonIds)) {
      for (const id of o.addonIds) {
        if (typeof id === 'string') addonQty[id] = (addonQty[id] ?? 0) + 1;
      }
    }
    return {
      packageId: typeof o.packageId === 'string' ? o.packageId : DEMO_PACKAGE_ID,
      qty: typeof o.qty === 'number' && o.qty >= 1 ? Math.floor(o.qty) : 1,
      addonQty,
    };
  } catch {
    return { packageId: DEMO_PACKAGE_ID, qty: 1, addonQty: {} };
  }
}
