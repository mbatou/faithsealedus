'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

export function OurStory() {
  const { t } = useLanguage();

  return (
    <section id="story" className="section-pad bg-noir">
      <div className="container-page">
        <SectionHeading index="01" kicker={t.story.kicker} title={t.story.title} />

        <div className="mx-auto mt-16 max-w-3xl">
          <div className="relative border-l border-gold/25 pl-8 sm:pl-10">
            {t.story.paragraphs.map((para, i) => (
              <Reveal key={i} delay={i * 0.1} className="relative pb-12 last:pb-0">
                <span
                  aria-hidden
                  className="absolute -left-[37px] top-2 h-2.5 w-2.5 rotate-45 bg-gold sm:-left-[45px]"
                />
                <p className="text-lg font-light leading-relaxed text-ivory-dim">
                  {para}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
