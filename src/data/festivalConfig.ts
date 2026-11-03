/** Minimal config so exact GuestCheckoutPage screen can render. */

export const FESTIVAL_CURRENCY = {
  locale: 'en-US',
  currency: 'USD',
} as const;

export const FESTIVAL_COPY = {
  intro: 'Crash My Playa 2027 — all-inclusive hotel + festival packages.',
  introCta: 'Packages from the 100x finder.',
  ticketTabs: '',
  supportEmail: 'help@feverup.com',
  privacyUrl: 'https://feverup.com/legal/privacy',
  officialSiteUrl: 'https://www.crashmyplaya.com/',
  officialSiteLabel: 'crashmyplaya.com',
  marketingBrand: 'Crash My Playa',
  venue: {
    name: 'Moon Palace Cancún',
    text: 'All-inclusive destination festival packages.',
  },
  gettingThere: {
    name: 'Moon Palace Cancún',
    address: 'Riviera Cancún, MX',
    lines: ['Airport shuttle from CUN included in packages.'],
    mapQuery: 'Moon Palace Cancún',
  },
} as const;
