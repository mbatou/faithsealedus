// The wedding's signature, as it appears on the camera frame, the album and
// downloaded keepsakes. Language-neutral on purpose: Roman-numeral dates echo
// the home-page marquee ("Accra · 2 XII").
import type { PhotoCountry, PhotoEvent } from './photo-rules';

export const COUPLE = 'Augusta & Georges';

const DAY: Partial<Record<PhotoEvent, string>> = {
  civil: '1',
  traditional: '2',
  dakar: '5',
};

const CITY: Record<PhotoCountry, string> = { ghana: 'Accra', senegal: 'Dakar' };

/** e.g. "Accra · 2 · XII · MMXXVI". The civil marriage line carries no city. */
export function frameLine(country: PhotoCountry, event: PhotoEvent): string {
  const day = DAY[event];
  const parts: string[] = [];
  if (event !== 'civil') parts.push(event === 'dakar' ? 'Dakar' : CITY[country]);
  if (day) parts.push(day);
  parts.push('XII', 'MMXXVI');
  return parts.join(' · ');
}
