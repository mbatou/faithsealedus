'use client';

import { Fragment } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

// Render *word* emphasis from the copy as italic <em>.
function withEmphasis(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((chunk, i) => {
    if (chunk.startsWith('*') && chunk.endsWith('*')) {
      return (
        <em key={i} className="not-italic text-gold">
          {chunk.slice(1, -1)}
        </em>
      );
    }
    return <Fragment key={i}>{chunk}</Fragment>;
  });
}

export function OurStory() {
  const { t } = useLanguage();

  return (
    <section id="story" className="section-pad bg-noir">
      <div className="container-page">
        <SectionHeading index="01" kicker={t.story.kicker} title={t.story.title} />

        <div className="mx-auto mt-16 max-w-3xl space-y-14">
          {t.story.movements.map((mv, i) => (
            <Reveal key={i} delay={i * 0.08} className="relative">
              <div className="flex items-baseline gap-4">
                <span className="index-num shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-serif text-2xl italic text-gold sm:text-3xl">
                    {mv.title}
                  </h3>
                  <p className="mt-4 text-lg font-light leading-relaxed text-ivory-dim">
                    {withEmphasis(mv.body)}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
