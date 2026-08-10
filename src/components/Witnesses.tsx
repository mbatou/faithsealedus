'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { Mark } from './Mark';

export function Witnesses() {
  const { t } = useLanguage();

  return (
    <section id="witnesses" className="section-pad bg-noir">
      <div className="container-page">
        <SectionHeading
          index="04"
          kicker={t.witnesses.kicker}
          title={t.witnesses.title}
          intro={t.witnesses.intro}
        />

        {/* Godmother of the union — spanning both homelands, above the panels */}
        <Reveal className="mx-auto mt-16 max-w-md text-center">
          <Mark className="mx-auto h-5 w-9 text-gold" />
          <p className="mt-4 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-ivory-dim/70">
            {t.witnesses.godmother.role}
          </p>
          <p className="mt-3 font-serif text-2xl text-gold sm:text-3xl">
            {t.witnesses.godmother.names}
          </p>
        </Reveal>

        {/* One panel per city, mirroring The Week's two acts */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-px overflow-hidden border border-gold/15 bg-gold/15 md:grid-cols-2">
          {t.witnesses.cities.map((city, ci) => (
            <Reveal key={ci} delay={ci * 0.12}>
              <div className="h-full bg-noir p-8 text-center sm:p-10">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl" aria-hidden>
                    {city.flag}
                  </span>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-gold">
                    {city.act}
                  </span>
                </div>

                <div className="mt-8 space-y-8">
                  {city.groups.map((group, gi) => (
                    <div key={gi}>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ivory-dim/70">
                        {group.role}
                      </p>
                      <p className="mt-3 font-serif text-xl text-gold sm:text-2xl">
                        {group.names}
                      </p>
                      {group.note && (
                        <p className="mx-auto mt-2 max-w-xs text-sm font-light leading-relaxed text-ivory-dim">
                          {group.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
