'use client';

import { useLanguage } from '@/context/LanguageContext';
import type { WeekEvent } from '@/lib/dictionary';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

const numerals = ['I', 'II', 'III', 'IV'];

function EventCard({ event, index }: { event: WeekEvent; index: number }) {
  const { t } = useLanguage();
  const labels = t.week.labels;
  const left = index % 2 === 0;

  return (
    <Reveal
      direction={left ? 'right' : 'left'}
      className={`relative md:w-1/2 ${left ? 'md:pr-16 md:text-right' : 'md:ml-auto md:pl-16'}`}
    >
      {/* Timeline node (desktop) */}
      <span
        aria-hidden
        className={`absolute top-12 hidden h-2 w-2 rotate-45 border border-gold bg-noir md:block ${
          left ? 'right-[-4px]' : 'left-[-4px]'
        }`}
      />

      <article className="card p-7 sm:p-9 md:text-left">
        <div className="flex items-center justify-between md:flex-row-reverse md:justify-between">
          <span
            className="font-serif text-5xl font-semibold leading-none text-gold/25"
            aria-hidden
          >
            {numerals[index] ?? index + 1}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xl" aria-hidden>
              {event.flag}
            </span>
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-gold">
              {event.country} · {event.city}
            </span>
          </div>
        </div>

        <h3 className="mt-6 font-serif text-2xl font-semibold text-ivory sm:text-3xl">
          {event.title}
        </h3>
        <p className="mt-2 font-serif text-lg italic text-gold">{event.date}</p>

        <dl className="mt-7 space-y-4 border-t border-gold/10 pt-6 text-sm">
          <div>
            <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-ivory-dim/50">
              {labels.when}
            </dt>
            <dd className="mt-1 text-ivory-dim">{event.time}</dd>
          </div>
          <div>
            <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-ivory-dim/50">
              {labels.where}
            </dt>
            <dd className="mt-1 text-ivory-dim">
              {event.venue}
              <br />
              <span className="text-ivory-dim/60">{event.address}</span>
            </dd>
          </div>
          <div>
            <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-ivory-dim/50">
              {labels.dress}
            </dt>
            <dd className="mt-1 text-ivory-dim">{event.dressCode}</dd>
          </div>
        </dl>

        <div className="mt-6 border-l border-gold/40 pl-4">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold">
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
          className="group mt-7 inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold transition hover:text-gold-light"
        >
          {labels.map}
          <span aria-hidden className="transition group-hover:translate-x-1">
            →
          </span>
        </a>
      </article>
    </Reveal>
  );
}

export function TheWeek() {
  const { t } = useLanguage();

  return (
    <section id="week" className="section-pad bg-noir">
      <div className="container-page">
        <SectionHeading
          index="02"
          kicker={t.week.kicker}
          title={t.week.title}
          intro={t.week.intro}
        />

        <div className="relative mt-20">
          <span
            aria-hidden
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gold/20 md:block"
          />
          <div className="space-y-10 md:space-y-24">
            {t.week.events.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
