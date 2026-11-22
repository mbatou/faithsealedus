// Pure date rules for guest photo sharing. Shared by server and client — no
// secrets, no I/O. Accra and Dakar are both UTC+0, so UTC dates are local dates.

export type PhotoCountry = 'ghana' | 'senegal';
export type PhotoEvent = 'civil' | 'traditional' | 'dakar' | 'moments';
export type PhotoStatus = 'pending' | 'published' | 'hidden' | 'deleted';
export type SitePhase = 'before' | 'live' | 'after';

export const PHOTO_CAP = 15;
export const CAPTION_MAX = 80;
export const GUEST_NAME_MAX = 60;

export const COUNTRIES: PhotoCountry[] = ['ghana', 'senegal'];
export const EVENTS: PhotoEvent[] = ['civil', 'traditional', 'dakar', 'moments'];

/** Senegal uploads open on 4 December; everything before counts for Ghana. */
export const SENEGAL_OPENS = Date.UTC(2026, 11, 4);
/** From 1 December the photo gallery leads the home page. */
export const GALLERY_FIRST = Date.UTC(2026, 11, 1);
/** After 6 December the week becomes a compact "Our week" recap. */
export const WEEK_OVER = Date.UTC(2026, 11, 7);

export function countryFor(date: Date): PhotoCountry {
  return date.getTime() < SENEGAL_OPENS ? 'ghana' : 'senegal';
}

export function eventFor(date: Date): PhotoEvent {
  if (date.getUTCFullYear() !== 2026 || date.getUTCMonth() !== 11) return 'moments';
  switch (date.getUTCDate()) {
    case 1:
      return 'civil';
    case 2:
      return 'traditional';
    case 5:
      return 'dakar';
    default:
      return 'moments';
  }
}

export function phaseFor(date: Date): SitePhase {
  const t = date.getTime();
  if (t < GALLERY_FIRST) return 'before';
  if (t < WEEK_OVER) return 'live';
  return 'after';
}

export function isCountry(v: unknown): v is PhotoCountry {
  return v === 'ghana' || v === 'senegal';
}

export function isEvent(v: unknown): v is PhotoEvent {
  return typeof v === 'string' && (EVENTS as string[]).includes(v);
}

/** A photo as the public gallery sees it. */
export interface GalleryPhoto {
  id: string;
  url: string;
  thumbUrl: string;
  width: number | null;
  height: number | null;
  caption: string | null;
  country: PhotoCountry;
  event: PhotoEvent;
  name: string;
  createdAt: string;
}
