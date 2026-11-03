import type { EventCheckoutState } from './checkoutState';
import { computeServiceFee } from './checkoutState';
import { FESTIVAL_EVENT_ID } from './festivalEvent';
import {
  EVENT,
  findPurchasableAddon,
  getPackage,
  type Package,
} from './packages';

/** Build the same EventCheckoutState shape Gaerten checkout screens expect. */
export function buildCheckoutStateFromPackage(
  packageId: string,
  addonQty: Record<string, number> | string[],
): EventCheckoutState | null {
  const pkg = getPackage(packageId);
  if (!pkg) return null;

  const qtyMap: Record<string, number> = Array.isArray(addonQty)
    ? Object.fromEntries(addonQty.map((id) => [id, 1]))
    : addonQty;

  const packageAmount = pkg.priceCents / 100;
  const lines = [
    {
      id: 'ticket',
      label: pkg.name,
      amount: packageAmount,
    },
    ...Object.entries(qtyMap).flatMap(([id, qty]) => {
      if (qty <= 0) return [];
      const item = findPurchasableAddon(id);
      if (!item) return [];
      return [
        {
          id: `addon-${id}`,
          label: qty > 1 ? `${item.name} × ${qty}` : item.name,
          amount: (item.priceCents / 100) * qty,
        },
      ];
    }),
  ];

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const serviceFee = computeServiceFee(subtotal);

  return {
    eventId: FESTIVAL_EVENT_ID,
    eventTitle: EVENT.title,
    eventImage: EVENT.image,
    venue: EVENT.venue,
    dateLine: `${EVENT.dates} · check-in ${pkg.checkIn}`,
    lines,
    subtotal,
    serviceFee,
    total: subtotal + serviceFee,
    returnTab: 'package',
    returnHash: packageId,
  };
}

export function describePackage(pkg: Package): string {
  return `${pkg.sectionLabel} · ${pkg.nights} nights · ${pkg.guests} guests`;
}
