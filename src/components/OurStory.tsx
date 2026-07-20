'use client';

import { Fragment, useRef, type ReactNode } from 'react';
import Image from 'next/image';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

/** Gentle vertical parallax as the block crosses the viewport. */
function Parallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  return (
    <motion.div ref={ref} style={{ y: reduce ? 0 : y }}>
      {children}
    </motion.div>
  );
}

// One photo per movement (portrait shots from the shoot).
const storyImages = ['/faithsealedus4.PNG', '/faithsealedus7.PNG', '/faithsealedus3.PNG'];

// Render *word* emphasis from the copy as a gold highlight.
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

        <div className="mt-16 space-y-16 sm:mt-24 sm:space-y-28">
          {t.story.movements.map((mv, i) => {
            const imageRight = i % 2 === 1;
            return (
              <div
                key={i}
                className="grid items-center gap-8 md:grid-cols-2 md:gap-14"
              >
                {/* Photo */}
                <Reveal
                  direction={imageRight ? 'left' : 'right'}
                  className={imageRight ? 'md:order-2' : ''}
                >
                  <Parallax>
                    <div className="relative">
                      <span
                        aria-hidden
                        className={`absolute -z-10 hidden h-full w-full border border-gold/30 md:block ${
                          imageRight ? '-bottom-3 -right-3' : '-bottom-3 -left-3'
                        }`}
                      />
                      <div className="relative aspect-[4/5] w-full overflow-hidden ring-1 ring-gold/25">
                        <Image
                          src={storyImages[i % storyImages.length]}
                          alt={`${t.hero.bride} & ${t.hero.groom}`}
                          fill
                          sizes="(max-width: 768px) 90vw, 45vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </Parallax>
                </Reveal>

                {/* Text */}
                <Reveal
                  direction="up"
                  delay={0.1}
                  className={imageRight ? 'md:order-1' : ''}
                >
                  <div className="flex items-center gap-3">
                    <span className="index-num">{String(i + 1).padStart(2, '0')}</span>
                    <span aria-hidden className="h-px w-10 bg-gold/40" />
                  </div>
                  <h3 className="mt-5 font-serif text-3xl italic text-gold sm:text-4xl">
                    {mv.title}
                  </h3>
                  <p className="mt-5 text-lg font-light leading-relaxed text-ivory-dim">
                    {withEmphasis(mv.body)}
                  </p>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
