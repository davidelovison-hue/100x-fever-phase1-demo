import { EVENT } from './packages';

export const FESTIVAL_EVENT_ID = EVENT.id;

/** Partner logo on Fever whitelabel nav (ForcedStepper / checkout). */
export const FESTIVAL_LOGO_SRC = `${import.meta.env.BASE_URL}cmp-logo.png`;

/** Fever wordmark shown beside partner logo (whitelabel credit). */
export const FEVER_WHITELABEL_MARK_SRC = `${import.meta.env.BASE_URL}fever-logo-white.svg`;

export const FESTIVAL_EVENT = {
  id: FESTIVAL_EVENT_ID,
  title: EVENT.title,
  image: EVENT.image,
  venue: EVENT.venue,
  dateLine: EVENT.dates,
};

export function getFestivalEvent(eventId: string) {
  if (eventId === FESTIVAL_EVENT_ID) return FESTIVAL_EVENT;
  return null;
}
