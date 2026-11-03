/** Checkout-only coral donation (left column, above payment). */

export const CHECKOUT_DONATION_LINE_ID = 'donation-coral';

export const CHECKOUT_DONATION = {
  title: 'Restore Coral Reefs in the Yucatán',
  logo: '/cmp-hero.jpg',
  logoAlt: 'Coral reef restoration',
  body:
    'Together we can bring life back to Mexico’s reefs. Every gift places a coral unit where 30+ marine species can thrive—and helps Crash My Playa give back to the Riviera Cancún community that hosts us.',
  feeNote: '$10 = 1 coral unit. No booking fees on this contribution.',
  secureNote: 'Your donation is secure',
  presets: [
    { label: '$10.00', amount: 10 },
    { label: '$20.00', amount: 20 },
    { label: '$50.00', amount: 50 },
  ] as const,
} as const;

export type DonationSelection =
  | { kind: 'none' }
  | { kind: 'preset'; amount: number }
  | { kind: 'custom'; amount: number | null };

export function donationAmountDollars(sel: DonationSelection): number {
  if (sel.kind === 'none') return 0;
  if (sel.kind === 'preset') return sel.amount;
  return sel.amount && sel.amount > 0 ? sel.amount : 0;
}
