'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

export function TravelStay() {
  const { t } = useLanguage();

  return (
    <section id="travel" className="section-pad bg-noir">
      <div className="container-page">
        <SectionHeading
          index="04"
          kicker={t.travel.kicker}
          title={t.travel.title}
          intro={t.travel.intro}
        />

        <div className="mt-16 grid gap-px overflow-hidden border border-gold/15 bg-gold/15 sm:grid-cols-2 lg:grid-cols-3">
          {t.travel.items.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 0.09}>
              <div className="group h-full bg-noir p-7 transition duration-500 hover:bg-panel">
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
    </section>
  );
}
