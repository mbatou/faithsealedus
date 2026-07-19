'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

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

        <div className="mx-auto mt-16 max-w-2xl divide-y divide-gold/15 border-y border-gold/15">
          {t.witnesses.groups.map((group, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="py-8 text-center">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-ivory-dim/70">
                  {group.role}
                </p>
                <p
                  className={`mt-3 font-serif text-2xl sm:text-3xl ${
                    group.tbd ? 'italic text-ivory-dim/60' : 'text-gold'
                  }`}
                >
                  {group.names}
                </p>
                {group.note && (
                  <p className="mx-auto mt-3 max-w-md text-sm font-light leading-relaxed text-ivory-dim">
                    {group.note}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
