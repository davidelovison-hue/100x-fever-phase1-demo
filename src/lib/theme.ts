/** Fever design tokens — aligned with Gaerten / Fever DS prototypes */

export const colors = {
  primary: '#111111',
  primaryLight: '#f3f3f3',
  primaryDark: '#000000',
  textDark: '#111111',
  textMuted: '#5d6c7b',
  textLight: '#aaadb0',
  border: '#e2e2e2',
  borderStrong: '#ccd2d8',
  background: '#fafafa',
  white: '#ffffff',
  accent: {
    blue: '#0079ca',
    blueLight: '#e6f4ff',
    green: '#24a865',
    greenDark: '#18824c',
    red: '#ea384c',
  },
} as const;

export const fonts = {
  heading: "'Jost', sans-serif",
  body: "'Inter', sans-serif",
} as const;

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatUsdExact(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}
