'use client';

import { useLanguage } from '@/context/LanguageContext';
import type { WeekEvent } from '@/lib/dictionary';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

function EventCard({ event, index }: { event: WeekEvent; index: number }) {
  const { t } = useLanguage();
  const labels = t.week.labels;
  const left = index % 2 === 0;

  return (
    <Reveal
      direction={left ? 'right' : 'left'}
      className={`relative md:w-1/2 ${left ? 'md:pr-14 md:text-right' : 'md:ml-auto md:pl-14'}`}
    >
      {/* Timeline node (desktop) */}
      <span
        aria-hidden
        className={`absolute top-10 hidden h-2.5 w-2.5 rotate-45 border border-gold bg-noir md:block ${
          left ? 'right-[-5px]' : 'left-[-5px]'
        }`}
      />

      <article className="card overflow-hidden">
        {/* gold hairline top rule */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        <div className="p-6 sm:p-8 md:text-left">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden>
              {event.flag}
            </span>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold">
              {event.country} · {event.city}
            </span>
          </div>

          <h3 className="mt-5 font-serif text-2xl font-semibold text-ivory sm:text-3xl">
            {event.title}
          </h3>
          <p className="mt-2 font-serif text-lg italic text-gold">{event.date}</p>

          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ivory-dim/60">
                {labels.when}
              </dt>
              <dd className="mt-1 text-ivory-dim">{event.time}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ivory-dim/60">
                {labels.where}
              </dt>
              <dd className="mt-1 text-ivory-dim">
                {event.venue}
                <br />
                <span className="text-ivory-dim/60">{event.address}</span>
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ivory-dim/60">
                {labels.dress}
              </dt>
              <dd className="mt-1 text-ivory-dim">{event.dressCode}</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-xl border border-gold/10 bg-charcoal-dark p-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold">
              {labels.culture}
            </p>
            <p className="mt-2 text-sm font-light leading-relaxed text-ivory-dim">
              {event.cultural}
            </p>
          </div>

          <a
            href={event.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-gold transition hover:text-gold-light"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
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
    <section id="week" className="section-pad bg-noir-soft">
      <div className="container-page">
        <SectionHeading kicker={t.week.kicker} title={t.week.title} intro={t.week.intro} />

        <div className="relative mt-20">
          {/* Central spine (desktop only) */}
          <span
            aria-hidden
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gold/20 md:block"
          />
          <div className="space-y-12 md:space-y-20">
            {t.week.events.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
