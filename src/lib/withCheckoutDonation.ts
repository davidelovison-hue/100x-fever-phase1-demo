import type { EventCheckoutState } from './checkoutState'
import { computeServiceFee } from './checkoutState'
import {
  CHECKOUT_DONATION_LINE_ID,
  donationAmountDollars,
  type DonationSelection,
} from './checkoutDonation'

/** Merge optional coral donation into basket totals for pay + summary. */
export function withCheckoutDonation(
  base: EventCheckoutState,
  selection: DonationSelection,
): EventCheckoutState {
  const amount = donationAmountDollars(selection)
  const lines = base.lines.filter((l) => l.id !== CHECKOUT_DONATION_LINE_ID)
  if (amount > 0) {
    lines.push({
      id: CHECKOUT_DONATION_LINE_ID,
      label: 'Coral reef donation',
      amount,
    })
  }
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0)
  const serviceFee = computeServiceFee(subtotal)
  return {
    ...base,
    lines,
    subtotal,
    serviceFee,
    total: subtotal + serviceFee,
  }
}
