'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

export function OurStory() {
  const { t } = useLanguage();

  return (
    <section id="story" className="section-pad bg-cream">
      <div className="container-page">
        <SectionHeading kicker={t.story.kicker} title={t.story.title} />

        <div className="mx-auto mt-14 max-w-3xl">
          <div className="relative border-l-2 border-dashed border-ochre/50 pl-8 sm:pl-10">
            {t.story.paragraphs.map((para, i) => (
              <Reveal key={i} delay={i * 0.08} className="relative pb-10 last:pb-0">
                <span
                  aria-hidden
                  className="absolute -left-[41px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-cream bg-terracotta shadow sm:-left-[49px]"
                />
                <p className="text-lg leading-relaxed text-ink/80">{para}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
