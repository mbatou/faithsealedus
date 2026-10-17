'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  CALENDAR_EVENTS,
  googleCalendarUrl,
  downloadIcs,
  type EventKey,
} from '@/lib/calendar';

/** Offered on booking confirmations so guests can save the date(s). */
export function AddToCalendar({ events }: { events: EventKey[] }) {
  const { t } = useLanguage();
  const c = t.calendar;

  if (events.length === 0) return null;

  const linkCls =
    'text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-gold underline-offset-4 transition hover:underline';

  return (
    <div className="mt-8 border-t border-gold/10 pt-6">
      <p className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold">
        {c.prompt}
      </p>
      <ul className="mt-4 space-y-2">
        {events.map((key) => {
          const details = {
            title: c.events[key],
            description: c.description,
            slot: CALENDAR_EVENTS[key],
          };
          return (
            <li
              key={key}
              className="flex flex-col gap-2 border border-gold/15 px-4 py-3 text-left sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-light text-ivory-dim">{c.events[key]}</span>
              <span className="flex shrink-0 items-center gap-4">
                <a
                  href={googleCalendarUrl(details)}
                  target="_blank"
                  rel="noreferrer"
                  className={linkCls}
                >
                  {c.google}
                </a>
                <button
                  type="button"
                  onClick={() => downloadIcs(`augusta-georges-${key}.ics`, details)}
                  className={linkCls}
                >
                  {c.apple}
                </button>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
