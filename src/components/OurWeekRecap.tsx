'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

/** After the week: the story and the events, condensed into one quiet section. */
export function OurWeekRecap() {
  const { t } = useLanguage();
  return (
    <section id="week" className="section-pad bg-noir">
      <div className="container-page">
        <SectionHeading kicker={t.ourWeek.kicker} title={t.ourWeek.title} intro={t.ourWeek.intro} />
        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
          {t.week.events.map((e, i) => (
            <Reveal key={e.id} delay={i * 0.1} className="card p-6">
              <p className="eyebrow">
                {e.flag} {e.act}
              </p>
              <p className="mt-3 font-serif text-xl text-ivory">{e.date}</p>
              <p className="mt-2 text-sm font-light text-ivory-dim">{e.blurb}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mx-auto mt-10 max-w-2xl space-y-4 text-center">
          {t.story.movements.map((m) => (
            <p key={m.title} className="text-sm font-light leading-relaxed text-ivory-dim">
              <span className="font-serif italic text-gold">{m.title}</span> — {m.body}
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
