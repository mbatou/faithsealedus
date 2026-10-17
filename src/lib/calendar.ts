// "Add to calendar" helpers. Ghana and Senegal are both UTC+0 year-round, so
// the UTC times below equal the local times guests will see.

export type EventKey = 'ghana' | 'senegal' | 'dinner';

export interface CalendarSlot {
  start: string; // UTC basic format: YYYYMMDDTHHMMSSZ
  end: string;
  location: string;
}

export const CALENDAR_EVENTS: Record<EventKey, CalendarSlot> = {
  ghana: {
    start: '20261202T100000Z',
    end: '20261202T160000Z',
    location: '19 Jacob Avenue, Nmai Djorn, Ashalley Botwe, Accra, Ghana',
  },
  senegal: {
    start: '20261205T170000Z',
    end: '20261205T220000Z',
    location: '312 Comico, Ouakam, Dakar, Senegal',
  },
  dinner: {
    start: '20261205T200000Z',
    end: '20261205T230000Z',
    location: 'Maison Madera, Ouakam, Dakar, Senegal',
  },
};

interface EventDetails {
  title: string;
  description: string;
  slot: CalendarSlot;
}

export function googleCalendarUrl({ title, description, slot }: EventDetails): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${slot.start}/${slot.end}`,
    location: slot.location,
    details: description,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function icsEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export function icsContent({ title, description, slot }: EventDetails): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Augusta & Georges//Wedding//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${slot.start}-${title.replace(/[^a-z0-9]/gi, '').slice(0, 24)}@faithsealedus`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${slot.start}`,
    `DTEND:${slot.end}`,
    `SUMMARY:${icsEscape(title)}`,
    `LOCATION:${icsEscape(slot.location)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcs(filename: string, details: EventDetails): void {
  const blob = new Blob([icsContent(details)], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
