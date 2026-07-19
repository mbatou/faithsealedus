'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

const icons = ['✈️', '🛬', '🔁', '🏨', '🌅', 'ℹ️'];

export function TravelStay() {
  const { t } = useLanguage();

  return (
    <section id="travel" className="section-pad bg-sand-50">
      <div className="container-page">
        <SectionHeading
          kicker={t.travel.kicker}
          title={t.travel.title}
          intro={t.travel.intro}
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.travel.items.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 0.07}>
              <div className="h-full rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-sm transition hover:shadow-md">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ochre/15 text-xl"
                  aria-hidden
                >
                  {icons[i % icons.length]}
                </span>
                <h3 className="mt-4 font-serif text-xl font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
