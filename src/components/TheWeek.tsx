'use client';

import { useLanguage } from '@/context/LanguageContext';
import type { WeekEvent } from '@/lib/dictionary';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

const accentStyles = {
  kente: {
    ring: 'border-kente-green/30',
    chip: 'bg-kente-green/10 text-kente-green',
    dot: 'bg-kente-green',
    band: 'bg-gradient-to-r from-kente-green via-kente-gold to-kente-red',
  },
  indigo: {
    ring: 'border-indigo-deep/30',
    chip: 'bg-indigo-deep/10 text-indigo-deep',
    dot: 'bg-indigo-deep',
    band: 'bg-gradient-to-r from-indigo-deep via-indigo-dusk to-ochre',
  },
} as const;

function EventCard({ event, index }: { event: WeekEvent; index: number }) {
  const { t } = useLanguage();
  const a = accentStyles[event.accent];
  const labels = t.week.labels;

  return (
    <Reveal
      direction={index % 2 === 0 ? 'right' : 'left'}
      className={`relative md:w-1/2 ${
        index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'
      }`}
    >
      {/* Timeline dot (desktop) */}
      <span
        aria-hidden
        className={`absolute top-8 hidden h-4 w-4 rounded-full border-4 border-cream md:block ${a.dot} ${
          index % 2 === 0 ? 'right-[-8px]' : 'left-[-8px]'
        }`}
      />

      <article
        className={`overflow-hidden rounded-3xl border bg-white/80 shadow-sm ${a.ring}`}
      >
        <div className={`h-2 w-full ${a.band}`} />
        <div className="p-6 sm:p-8 md:text-left">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>
              {event.flag}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${a.chip}`}
            >
              {event.country} · {event.city}
            </span>
          </div>

          <h3 className="mt-4 font-serif text-2xl font-semibold text-ink sm:text-3xl">
            {event.title}
          </h3>
          <p className="mt-1 font-script text-2xl text-terracotta">{event.date}</p>

          <dl className="mt-5 space-y-3 text-sm">
            <div>
              <dt className="font-semibold uppercase tracking-wide text-ink/50">
                {labels.when}
              </dt>
              <dd className="mt-0.5 text-ink/80">{event.time}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wide text-ink/50">
                {labels.where}
              </dt>
              <dd className="mt-0.5 text-ink/80">
                {event.venue}
                <br />
                <span className="text-ink/60">{event.address}</span>
              </dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wide text-ink/50">
                {labels.dress}
              </dt>
              <dd className="mt-0.5 text-ink/80">{event.dressCode}</dd>
            </div>
          </dl>

          <div className="mt-5 rounded-2xl bg-sand-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ochre-dark">
              {labels.culture}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink/75">{event.cultural}</p>
          </div>

          <a
            href={event.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-terracotta transition hover:text-terracotta-dark"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M12 21s-6-5.686-6-10a6 6 0 1112 0c0 4.314-6 10-6 10z" />
              <circle cx="12" cy="11" r="2" />
            </svg>
            {labels.map}
          </a>
        </div>
      </article>
    </Reveal>
  );
}

export function TheWeek() {
  const { t } = useLanguage();

  return (
    <section id="week" className="section-pad bg-sand-50">
      <div className="container-page">
        <SectionHeading kicker={t.week.kicker} title={t.week.title} intro={t.week.intro} />

        <div className="relative mt-16">
          {/* Central spine (desktop only) */}
          <span
            aria-hidden
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-ochre/40 md:block"
          />
          <div className="space-y-10 md:space-y-16">
            {t.week.events.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
