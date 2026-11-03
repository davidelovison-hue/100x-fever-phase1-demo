/**
 * CMP 2027 inventory derived from crashmyplaya.com (accommodations, packages, plan, FAQs).
 * Prices are demo estimates — live on-sale prices are not published yet on the site.
 */

import { publicAsset } from './publicAsset';

export type Resort = 'moon-palace' | 'belmond';
export type Section =
  | 'run-of-house'
  | 'venue'
  | 'sunrise'
  | 'nizuc'
  | 'grand'
  | 'golf'
  | 'belmond';

export type AddonCategory =
  | 'experience'
  | 'protection'
  | 'merch'
  | 'impact';

export type Addon = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  per: 'package' | 'person' | 'item';
  category: AddonCategory;
  /** Optional card image under /public */
  image?: string;
};

/**
 * Impact / donation add-on invented like Gaerten PlanEntity:
 * amount chips (variant axis) + quantity (+ See more sheet).
 */
export type ImpactAmountChip = {
  label: string;
  priceCents: number;
};

export type ImpactAddon = {
  id: string;
  name: string;
  /** Short line under title, e.g. "$10 = 1 Coral Unit" */
  unitHint: string;
  /** Default / from price (first chip). */
  priceCents: number;
  image: string;
  listingTag: string;
  /** Short card description (clamped). */
  description: string;
  cardPreviewBullets: string[];
  /** TicketDetailsSheet checklist (Gaerten includedItems). */
  includedItems: string[];
  /** Gaerten-style amount chips ($10 / $20 / …). */
  amountChips: ImpactAmountChip[];
};

/** Crash My Playa “Package Details” block for See more. */
export type PackageDetails = {
  highlights: string[];
  overview: string;
  finerDetails: string[];
  disclaimer: string;
};

export type Package = {
  id: string;
  /** 100x package id stored on Fever session type for reconciliation */
  packageId100x: string;
  name: string;
  resort: Resort;
  section: Section;
  sectionLabel: string;
  roomType: string;
  bed: string;
  nights: 4 | 5 | 6;
  checkIn: string;
  checkOut: string;
  guests: number;
  /** Shared capacity pool id (session-type group) */
  poolId: string;
  capacity: number;
  remaining: number;
  priceCents: number;
  includes: string[];
  /** Full CMP package details (See more sheet). */
  details?: PackageDetails;
};

export const EVENT = {
  id: 'cmp-2027',
  title: 'Crash My Playa 2027',
  subtitle: 'Four nights of country music · Riviera Cancún',
  dates: 'January 13–16, 2027',
  venue: 'Moon Palace Cancún & Belmond Maroma',
  image: publicAsset('cmp-hero.jpg'),
} as const;

/** Post-package add-ons (Fever step after Continue) — not hotel nights. */
export const ADDONS: Addon[] = [
  {
    id: 'cenote-adventure',
    name: 'Cenote & jungle adventure',
    description: 'Half-day guided swim + jungle walk. Pickup from Moon Palace.',
    priceCents: 12900,
    per: 'person',
    category: 'experience',
    image: publicAsset('room-2.webp'),
  },
  {
    id: 'beach-club-day',
    name: 'Beach club day pass',
    description: 'Reserved daybeds + open bar at a partner beach club (non-show day).',
    priceCents: 9900,
    per: 'person',
    category: 'experience',
    image: publicAsset('room-1.webp'),
  },
  {
    id: 'merch-tee',
    name: 'Official festival tee',
    description: 'Soft cotton Crash My Playa tee. Unisex sizing. Pickup at Guest Services.',
    priceCents: 4500,
    per: 'item',
    category: 'merch',
    image: publicAsset('merch/tee.jpg'),
  },
  {
    id: 'merch-hoodie',
    name: 'Festival hoodie',
    description: 'Heavyweight pullover with embroidered CMP mark. Collected on arrival.',
    priceCents: 8500,
    per: 'item',
    category: 'merch',
    image: publicAsset('merch/hoodie.jpg'),
  },
  {
    id: 'merch-tote',
    name: 'Canvas tote bag',
    description: 'Day-to-night tote for beach runs and merch hauls.',
    priceCents: 2800,
    per: 'item',
    category: 'merch',
    image: publicAsset('merch/tote.jpg'),
  },
  {
    id: 'merch-hat',
    name: 'Trucker hat',
    description: 'Mesh-back CMP trucker. Adjustable snap. One size.',
    priceCents: 3500,
    per: 'item',
    category: 'merch',
    image: publicAsset('merch/hat.jpg'),
  },
  {
    id: 'merch-lanyard',
    name: 'Festival lanyard',
    description: 'Official Crash My Playa lanyard with detachable badge clip.',
    priceCents: 1500,
    per: 'item',
    category: 'merch',
    image: publicAsset('merch/lanyard.jpg'),
  },
];

export const ADDON_CATEGORY_LABEL: Record<AddonCategory, string> = {
  protection: 'Protection',
  experience: 'Experiences',
  merch: 'Merch',
  impact: 'Donation',
};

/** Gaerten-style impact add-on (amount chips + qty + See more). */
export const IMPACT_ADDONS: ImpactAddon[] = [
  {
    id: 'coral-reef',
    name: 'Restore Coral Reefs in the Yucatán',
    unitHint: '$10 = 1 Coral Unit',
    priceCents: 1000,
    image: publicAsset('cmp-hero.jpg'),
    listingTag: 'Sale ends in 74 days',
    description:
      'Help restore vital coral reefs off the Yucatán Peninsula. Every $10 funds one coral unit. Pick an amount, then add quantity to increase your donation.',
    cardPreviewBullets: [],
    includedItems: [
      'Help restore vital coral reefs off the Yucatán Peninsula. In partnership with local experts, every $10 funds the placement of one coral unit back on the reef. Each unit can support 30+ marine species as it grows, boosting biodiversity in Mexico’s reef systems. This initiative is one example of how Crash My Playa and 100x are working together to address the overall carbon footprint of guests, artists, and staff in Mexico—including travel and transportation emissions as well as energy generated throughout the resort and venue.',
      'We recognize the crucial role that guests play in our mission to be more sustainable. For this reason and more, we hope you’ll consider an additional contribution to help Crash My Playa mitigate its footprint while also giving back to the local community that gives us so much during our stay.',
      'We will continue to raise money on-site via various activations and donation opportunities. Your donation will help minimize our impact on the Yucatán Peninsula while supporting important causes and nonprofits in the Riviera Cancún region. If you feel inclined, you can add multiple quantities of this ticket type to increase your total donation.',
      'No fees on this item',
    ],
    amountChips: [
      { label: '$10', priceCents: 1000 },
      { label: '$20', priceCents: 2000 },
      { label: '$30', priceCents: 3000 },
      { label: '$40', priceCents: 4000 },
      { label: '$50', priceCents: 5000 },
    ],
  },
];

/** Cart line id for an impact amount chip, e.g. coral-reef@2000 */
export function impactLineId(addonId: string, priceCents: number): string {
  return `${addonId}@${priceCents}`;
}

export function parseImpactLineId(
  id: string,
): { addonId: string; priceCents: number } | null {
  const at = id.lastIndexOf('@');
  if (at <= 0) return null;
  const addonId = id.slice(0, at);
  const priceCents = Number(id.slice(at + 1));
  if (!IMPACT_ADDONS.some((a) => a.id === addonId) || !Number.isFinite(priceCents)) {
    return null;
  }
  return { addonId, priceCents };
}

export function findPurchasableAddon(id: string): {
  name: string;
  priceCents: number;
} | null {
  const addon = ADDONS.find((a) => a.id === id);
  if (addon) return { name: addon.name, priceCents: addon.priceCents };

  const impactLine = parseImpactLineId(id);
  if (impactLine) {
    const impact = IMPACT_ADDONS.find((a) => a.id === impactLine.addonId);
    if (!impact) return null;
    const chip = impact.amountChips.find(
      (c) => c.priceCents === impactLine.priceCents,
    );
    const label = chip?.label ?? formatCents(impactLine.priceCents);
    return {
      name: `${impact.name} (${label})`,
      priceCents: impactLine.priceCents,
    };
  }

  const impact = IMPACT_ADDONS.find((a) => a.id === id);
  if (impact) return { name: impact.name, priceCents: impact.priceCents };
  return null;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

const baseIncludes = [
  'All-inclusive stay (food & drinks)',
  'Venue admission each show night',
  'Pool parties & late-night sets',
  'Airport shuttle (CUN ↔ Moon Palace)',
  'Official welcome gift',
];

const belmondIncludes = [
  '4 nights at Belmond Maroma',
  'Daily à la carte breakfast',
  '$500 pp food & beverage credit',
  'Private airport & event transport',
  'Venue admission + Moon Palace event spaces',
];

function pkg(
  partial: Omit<Package, 'includes'> & { includes?: string[] },
): Package {
  return {
    ...partial,
    includes: partial.includes ?? baseIncludes,
  };
}

/** Live finder example SKU — CMP package details from crashmyplaya.com. */
const DEMO_PACKAGE_DETAILS: PackageDetails = {
  highlights: [
    'Five (5) Nights at Run of House (Check In Wednesday 1/13/2027 & Check Out 1/18/2027)',
    'Admission for Four (4) into the venue for each night of the show',
    'Airport transportation to and from the hotel in exclusive Crash My Playa shuttles',
    'Four (4) exclusive Crash My Playa Official Merchandise Gift(s)',
  ],
  overview:
    'Our Run of House rooms offer event access at our most affordable price, equipped with all the amenities and comforts you need to enjoy your stay.',
  finerDetails: [
    'Run of House rooms will be randomly assigned at check-in and can be any room type within the various resort sections: Venue, Sunrise, Nizuc, Golf Course, or The Grand.',
    'You are not guaranteed a specific room, location, or view',
    'With this package selection, bed type changes and room type changes are not permitted',
    'This selection is for three or four people',
  ],
  disclaimer:
    'All packages and other products or services described herein are subject to the Crash My Playa purchase policy.',
};

/**
 * Demo starter package — taken from live 100x guided finder URL:
 * https://www.crashmyplaya.com/packages#/?number-of-nights=5&check-in-date=01/13/2027
 * &number-of-guests=4&collection=Run+of+House&room-type=Run+of+House+| +Double
 * &pkg=4ADAF53A-27CA-4186-9EB2-A1BEB0EE9917&col=A67A8E40-5B60-49CA-81D0-A818A1FC7F66
 */
export const DEMO_PACKAGE_ID = '4ADAF53A-27CA-4186-9EB2-A1BEB0EE9917';

export const DEMO_FINDER_SELECTION = {
  numberOfNights: 5,
  checkInDate: '01/13/2027',
  numberOfGuests: 4,
  collection: 'Run of House',
  roomType: 'Run of House | Double',
  available: true,
  flow: 'guided',
  step: 5,
  col: 'A67A8E40-5B60-49CA-81D0-A818A1FC7F66',
  pkg: DEMO_PACKAGE_ID,
  sourceUrl:
    'https://www.crashmyplaya.com/packages#/?number-of-nights=5&check-in-date=01%2F13%2F2027&number-of-guests=4&collection=Run+of+House&room-type=Run+of+House+%7C+Double&available=true&flow=guided&step=5&col=A67A8E40-5B60-49CA-81D0-A818A1FC7F66&pkg=4ADAF53A-27CA-4186-9EB2-A1BEB0EE9917',
} as const;

/** Representative slice of ~750 packages — enough for a finder demo */
export const PACKAGES: Package[] = [
  pkg({
    id: DEMO_PACKAGE_ID,
    packageId100x: DEMO_PACKAGE_ID,
    name: 'Run of House | Double · 5 nights · 4 guests',
    resort: 'moon-palace',
    section: 'run-of-house',
    sectionLabel: 'Run of House',
    roomType: 'Run of House | Double',
    bed: 'Double (Run of House — assigned at check-in)',
    nights: 5,
    checkIn: '2027-01-13',
    checkOut: '2027-01-18',
    guests: 4,
    poolId: 'A67A8E40-5B60-49CA-81D0-A818A1FC7F66',
    capacity: 40,
    remaining: 22,
    /** Live finder review total for this SKU ($9,699) */
    priceCents: 969900,
    includes: DEMO_PACKAGE_DETAILS.highlights,
    details: DEMO_PACKAGE_DETAILS,
  }),
  pkg({
    id: 'roh-4n-2g-jan13',
    packageId100x: 'CMP27-ROH-4N-2G-0113',
    name: 'Run of House · 4 nights · 2 guests',
    resort: 'moon-palace',
    section: 'run-of-house',
    sectionLabel: 'Run of House',
    roomType: 'Run of House',
    bed: 'King or Two Doubles (assigned at check-in)',
    nights: 4,
    checkIn: '2027-01-13',
    checkOut: '2027-01-17',
    guests: 2,
    poolId: 'pool-roh-4n-jan13',
    capacity: 40,
    remaining: 28,
    priceCents: 249900,
  }),
  pkg({
    id: 'venue-dlx-king-4n-2g-jan13',
    packageId100x: 'CMP27-VEN-DLX-K-4N-2G-0113',
    name: 'Venue Deluxe King · 4 nights · 2 guests',
    resort: 'moon-palace',
    section: 'venue',
    sectionLabel: 'Venue',
    roomType: 'Deluxe',
    bed: 'King',
    nights: 4,
    checkIn: '2027-01-13',
    checkOut: '2027-01-17',
    guests: 2,
    poolId: 'pool-venue-dlx-king-4n-jan13',
    capacity: 12,
    remaining: 7,
    priceCents: 329900,
  }),
  pkg({
    id: 'venue-dlx-dd-4n-2g-jan13',
    packageId100x: 'CMP27-VEN-DLX-DD-4N-2G-0113',
    name: 'Venue Deluxe Two Doubles · 4 nights · 2 guests',
    resort: 'moon-palace',
    section: 'venue',
    sectionLabel: 'Venue',
    roomType: 'Deluxe',
    bed: 'Two Doubles',
    nights: 4,
    checkIn: '2027-01-13',
    checkOut: '2027-01-17',
    guests: 2,
    poolId: 'pool-venue-dlx-dd-4n-jan13',
    capacity: 10,
    remaining: 4,
    priceCents: 329900,
  }),
  pkg({
    id: 'venue-ov-king-4n-2g-jan13',
    packageId100x: 'CMP27-VEN-OV-K-4N-2G-0113',
    name: 'Venue Deluxe Ocean View King · 4 nights · 2 guests',
    resort: 'moon-palace',
    section: 'venue',
    sectionLabel: 'Venue',
    roomType: 'Deluxe Ocean View',
    bed: 'King',
    nights: 4,
    checkIn: '2027-01-13',
    checkOut: '2027-01-17',
    guests: 2,
    poolId: 'pool-venue-ov-king-4n-jan13',
    capacity: 8,
    remaining: 3,
    priceCents: 379900,
  }),
  pkg({
    id: 'sunrise-dlx-king-4n-2g-jan13',
    packageId100x: 'CMP27-SUN-DLX-K-4N-2G-0113',
    name: 'Sunrise Deluxe King · 4 nights · 2 guests',
    resort: 'moon-palace',
    section: 'sunrise',
    sectionLabel: 'Sunrise',
    roomType: 'Deluxe',
    bed: 'King',
    nights: 4,
    checkIn: '2027-01-13',
    checkOut: '2027-01-17',
    guests: 2,
    poolId: 'pool-sunrise-dlx-king-4n-jan13',
    capacity: 16,
    remaining: 11,
    priceCents: 299900,
  }),
  pkg({
    id: 'sunrise-dlx-king-5n-2g-jan12',
    packageId100x: 'CMP27-SUN-DLX-K-5N-2G-0112',
    name: 'Sunrise Deluxe King · 5 nights · 2 guests',
    resort: 'moon-palace',
    section: 'sunrise',
    sectionLabel: 'Sunrise',
    roomType: 'Deluxe',
    bed: 'King',
    nights: 5,
    checkIn: '2027-01-12',
    checkOut: '2027-01-17',
    guests: 2,
    poolId: 'pool-sunrise-dlx-king-5n-jan12',
    capacity: 10,
    remaining: 6,
    priceCents: 349900,
  }),
  pkg({
    id: 'nizuc-dlx-dd-4n-2g-jan13',
    packageId100x: 'CMP27-NIZ-DLX-DD-4N-2G-0113',
    name: 'Nizuc Deluxe Two Doubles · 4 nights · 2 guests',
    resort: 'moon-palace',
    section: 'nizuc',
    sectionLabel: 'Nizuc',
    roomType: 'Deluxe',
    bed: 'Two Doubles',
    nights: 4,
    checkIn: '2027-01-13',
    checkOut: '2027-01-17',
    guests: 2,
    poolId: 'pool-nizuc-dlx-dd-4n-jan13',
    capacity: 14,
    remaining: 9,
    priceCents: 289900,
  }),
  pkg({
    id: 'nizuc-dlx-king-6n-2g-jan12',
    packageId100x: 'CMP27-NIZ-DLX-K-6N-2G-0112',
    name: 'Nizuc Deluxe King · 6 nights · 2 guests',
    resort: 'moon-palace',
    section: 'nizuc',
    sectionLabel: 'Nizuc',
    roomType: 'Deluxe',
    bed: 'King',
    nights: 6,
    checkIn: '2027-01-12',
    checkOut: '2027-01-18',
    guests: 2,
    poolId: 'pool-nizuc-dlx-king-6n-jan12',
    capacity: 6,
    remaining: 2,
    priceCents: 399900,
  }),
  pkg({
    id: 'grand-dlx-king-4n-2g-jan13',
    packageId100x: 'CMP27-GRD-DLX-K-4N-2G-0113',
    name: 'The Grand Deluxe King · 4 nights · 2 guests',
    resort: 'moon-palace',
    section: 'grand',
    sectionLabel: 'The Grand',
    roomType: 'Deluxe',
    bed: 'King',
    nights: 4,
    checkIn: '2027-01-13',
    checkOut: '2027-01-17',
    guests: 2,
    poolId: 'pool-grand-dlx-king-4n-jan13',
    capacity: 8,
    remaining: 5,
    priceCents: 419900,
  }),
  pkg({
    id: 'golf-dlx-king-4n-2g-jan13',
    packageId100x: 'CMP27-GLF-DLX-K-4N-2G-0113',
    name: 'Golf Course Deluxe King · 4 nights · 2 guests',
    resort: 'moon-palace',
    section: 'golf',
    sectionLabel: 'Golf Course',
    roomType: 'Deluxe',
    bed: 'King',
    nights: 4,
    checkIn: '2027-01-13',
    checkOut: '2027-01-17',
    guests: 2,
    poolId: 'pool-golf-dlx-king-4n-jan13',
    capacity: 12,
    remaining: 8,
    priceCents: 279900,
  }),
  pkg({
    id: 'venue-connected-4n-4g-jan13',
    packageId100x: 'CMP27-VEN-CONN-4N-4G-0113',
    name: 'Venue Two-Room Connected · 4 nights · 4 guests',
    resort: 'moon-palace',
    section: 'venue',
    sectionLabel: 'Venue',
    roomType: 'Deluxe Two-Room Connected',
    bed: 'King + Two Doubles',
    nights: 4,
    checkIn: '2027-01-13',
    checkOut: '2027-01-17',
    guests: 4,
    poolId: 'pool-venue-conn-4n-jan13',
    capacity: 4,
    remaining: 1,
    priceCents: 629900,
  }),
  pkg({
    id: 'pres-suite-4n-4g-jan13',
    packageId100x: 'CMP27-PRES-4N-4G-0113',
    name: 'Presidential Suite · 4 nights · 4 guests',
    resort: 'moon-palace',
    section: 'grand',
    sectionLabel: 'The Grand',
    roomType: 'Presidential Suite',
    bed: 'King + living areas',
    nights: 4,
    checkIn: '2027-01-13',
    checkOut: '2027-01-17',
    guests: 4,
    poolId: 'pool-pres-4n-jan13',
    capacity: 2,
    remaining: 1,
    priceCents: 899900,
  }),
  pkg({
    id: 'belmond-ov-4n-2g-jan13',
    packageId100x: 'CMP27-BEL-OV-4N-2G-0113',
    name: 'Belmond Maroma Ocean View · 4 nights · 2 guests',
    resort: 'belmond',
    section: 'belmond',
    sectionLabel: 'Belmond Maroma',
    roomType: 'Ocean View Suite',
    bed: 'King',
    nights: 4,
    checkIn: '2027-01-13',
    checkOut: '2027-01-17',
    guests: 2,
    poolId: 'pool-belmond-ov-4n-jan13',
    capacity: 6,
    remaining: 3,
    priceCents: 549900,
    includes: belmondIncludes,
  }),
  pkg({
    id: 'belmond-prem-4n-2g-jan13',
    packageId100x: 'CMP27-BEL-PREM-4N-2G-0113',
    name: 'Belmond Maroma Premium Ocean View · 4 nights · 2 guests',
    resort: 'belmond',
    section: 'belmond',
    sectionLabel: 'Belmond Maroma',
    roomType: 'Premium Ocean View Suite',
    bed: 'King',
    nights: 4,
    checkIn: '2027-01-13',
    checkOut: '2027-01-17',
    guests: 2,
    poolId: 'pool-belmond-prem-4n-jan13',
    capacity: 4,
    remaining: 2,
    priceCents: 649900,
    includes: belmondIncludes,
  }),
];

export function getPackage(id: string): Package | undefined {
  return PACKAGES.find((p) => p.id === id);
}

export function formatCheckIn(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const SECTION_BLURBS: Record<Section, string> = {
  'run-of-house':
    'Lowest priced rooms with full event access. Assigned at check-in from any Moon Palace section.',
  venue: 'Closest access to the oceanfront stage. Keep the music close.',
  sunrise: 'Central — easy access to the pool stage and a short walk to the main venue.',
  nizuc: 'Quieter section, short walk or golf-cart ride to the venue. Great for families.',
  grand: 'The Grand amenities — exclusive access for Grand / Villa / Residence / Presidential guests.',
  golf: 'Surrounded by greenery in the Golf Course section.',
  belmond:
    'Jungle-set Belmond Maroma with private transport and $500 pp F&B credit. Event access at Moon Palace.',
};
