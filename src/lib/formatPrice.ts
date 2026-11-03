import { FESTIVAL_CURRENCY } from '../data/festivalConfig';

export function formatPrice(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  return new Intl.NumberFormat(FESTIVAL_CURRENCY.locale, {
    style: 'currency',
    currency: FESTIVAL_CURRENCY.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}
