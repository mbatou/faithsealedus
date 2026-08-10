'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

function Plane({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M2.5 12.5l19-7-7 19-2.6-8.2-9.4-3.8z" />
    </svg>
  );
}

export function TravelStay() {
  const { t } = useLanguage();
  const f = t.travel.flights;

  return (
    <section id="travel" className="section-pad bg-noir">
      <div className="container-page">
        <SectionHeading
          index="05"
          kicker={t.travel.kicker}
          title={t.travel.title}
          intro={t.travel.intro}
        />

        {/* Flights — the featured itinerary */}
        <Reveal className="mt-16">
          <div className="card p-7 sm:p-10">
            <div className="flex items-center justify-between">
              <p className="eyebrow">{f.label}</p>
              <Plane className="h-5 w-5 text-gold/60" />
            </div>
            <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-ivory-dim">
              {f.intro}
            </p>

            <div className="mt-9 grid gap-9 md:grid-cols-2">
              {f.legs.map((leg, i) => (
                <div
                  key={i}
                  className={
                    i === 1 ? 'md:border-l md:border-gold/15 md:pl-9' : ''
                  }
                >
                  <div className="flex items-center gap-3">
                    <Plane className="h-4 w-4 shrink-0 text-gold" />
                    <h3 className="font-serif text-2xl italic text-gold">
                      {leg.route}
                    </h3>
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-ivory">
                    {leg.day}
                  </p>
                  <p className="mt-3 text-sm font-light leading-relaxed text-ivory-dim">
                    {leg.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Airline we booked + link for guests to join */}
            <div className="mt-9 flex flex-col gap-4 border-t border-gold/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-gold/30">
                  <Plane className="h-4 w-4 text-gold" />
                </span>
                <p className="text-sm text-ivory sm:text-base">{f.airline}</p>
              </div>
              <a
                href={f.airlineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost shrink-0 self-start sm:self-auto"
              >
                {f.airlineLinkLabel}
              </a>
            </div>
          </div>
        </Reveal>

        {/* Stay & essentials */}
        <div className="mt-16">
          <Reveal>
            <p className="eyebrow">{t.travel.stayLabel}</p>
          </Reveal>
          <div className="mt-6 grid gap-px overflow-hidden border border-gold/15 bg-gold/15 sm:grid-cols-3">
            {t.travel.items.map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 0.09}>
                <div className="group h-full bg-noir p-7 transition duration-500 hover:bg-surface">
                  <div className="flex items-baseline justify-between">
                    <span className="index-num">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      aria-hidden
                      className="h-px w-10 bg-gold/30 transition-all duration-500 group-hover:w-16"
                    />
                  </div>
                  <h3 className="mt-6 font-serif text-xl font-semibold text-ivory">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm font-light leading-relaxed text-ivory-dim">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
