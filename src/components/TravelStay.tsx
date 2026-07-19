'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

const icons = ['✈️', '🛬', '🔁', '🏨', '🌅', 'ℹ️'];

export function TravelStay() {
  const { t } = useLanguage();

  return (
    <section id="travel" className="section-pad bg-noir-soft">
      <div className="container-page">
        <SectionHeading
          kicker={t.travel.kicker}
          title={t.travel.title}
          intro={t.travel.intro}
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.travel.items.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 0.09}>
              <div className="card h-full p-6 transition duration-500 hover:border-gold/35">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 bg-charcoal-dark text-xl"
                  aria-hidden
                >
                  {icons[i % icons.length]}
                </span>
                <h3 className="mt-5 font-serif text-xl font-semibold text-ivory">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-ivory-dim">
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
