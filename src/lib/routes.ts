/** Paths for React Router — Fever event steps match Gaerten exactly. */

import { FESTIVAL_EVENT_ID } from './festivalEvent';

export const FORCED_STEPPER_PATH = '/ForcedStepper';

const PLAN_ORIGIN_KEY = 'cmp.planOrigin';

export function isForcedStepperPath(pathname: string): boolean {
  return pathname.replace(/\/$/, '') === FORCED_STEPPER_PATH;
}

export function rememberPlanOrigin(_pathname: string): void {
  try {
    sessionStorage.setItem(PLAN_ORIGIN_KEY, '/');
  } catch {
    /* ignore */
  }
}

/** 100x finder (outside Fever). Used where Gaerten returns to plan. */
export function planHomePath(): string {
  return '/';
}

export function planPath(hash?: string): string {
  const home = planHomePath();
  return hash ? `${home}#${hash.replace(/^#/, '')}` : home;
}

export function scrollPlanPath(hash?: string): string {
  return planPath(hash);
}

export function immersivePlanPath(hash?: string): string {
  return planPath(hash);
}

export function eventPath(eventId: string, hash?: string): string {
  void eventId;
  return planPath(hash ?? 'entry');
}

/** Fever ForcedStepper handoff — lands on package step with autozoom. */
export function handoverPath(packageId?: string): string {
  const base = `/event/${FESTIVAL_EVENT_ID}`;
  const withPkg = packageId
    ? `${base}?package_id=${encodeURIComponent(packageId)}`
    : base;
  return `${withPkg}#package`;
}

/** React Router location object for Buy Now → Fever package autozoom. */
export function handoverLocation(packageId: string) {
  return {
    pathname: `/event/${FESTIVAL_EVENT_ID}`,
    search: `?package_id=${encodeURIComponent(packageId)}`,
    hash: '#package',
  } as const;
}

/** Fever add-ons step (same ForcedStepper page, #addons). */
export function addonsPath(eventId: string, packageId?: string): string {
  const base = `/event/${eventId}`;
  const withPkg = packageId
    ? `${base}?package_id=${encodeURIComponent(packageId)}`
    : base;
  return `${withPkg}#addons`;
}

export function connectPath(eventId: string): string {
  return `/event/${eventId}/connect`;
}

export function checkoutPath(eventId: string): string {
  return `/event/${eventId}/checkout`;
}

export function guestCheckoutPath(eventId: string): string {
  return `/event/${eventId}/guest-checkout`;
}

export function pmrPreBookingPath(eventId: string): string {
  return `/event/${eventId}/pmr-questions`;
}

export function orderConfirmationPath(eventId: string): string {
  return `/event/${eventId}/confirmation`;
}

export function postBookingPath(eventId: string): string {
  return `/event/${eventId}/post-booking`;
}

export function postBookingAbsolutePath(eventId: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = `/event/${encodeURIComponent(eventId)}/post-booking`;
  return base ? `${base}${path}` : path;
}

export function orderConfirmationAbsolutePath(eventId: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = `/event/${encodeURIComponent(eventId)}/confirmation`;
  return base ? `${base}${path}` : path;
}

export function accountPath(): string {
  return '/account';
}

/** @deprecated use planPath */
export function hubPath(hash?: string): string {
  return planPath(hash);
}
