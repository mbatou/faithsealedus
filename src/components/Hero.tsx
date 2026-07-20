'use client';

import Image from 'next/image';
import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Mark } from './Mark';

export function Hero() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Subtle parallax + zoom on the photo, and a black veil that ramps up so the
  // hero fades to #0B0B0B and hands off cleanly to the next section.
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '12%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.1]);
  const veil = useTransform(scrollYProgress, [0, 0.9], [0, 0.92]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, reduce ? 0 : 50]);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.16, delayChildren: 0.3 } },
  };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  // Letter-by-letter blur-in for the names.
  const nameGroup = {
    hidden: {},
    visible: { transition: { staggerChildren: reduce ? 0 : 0.05 } },
  };
  const letter = {
    hidden: reduce
      ? { opacity: 0 }
      : { opacity: 0, y: 22, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
    },
  };
  const renderName = (text: string) =>
    [...text].map((ch, i) => (
      <motion.span key={i} variants={letter} className="inline-block">
        {ch}
      </motion.span>
    ));

  return (
    <section
      ref={ref}
      id="top"
      className="relative h-[100svh] min-h-[600px] overflow-hidden bg-noir"
    >
      {/* Full-bleed background photo with subtle parallax */}
      <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0">
        <Image
          src="/DSCF9486.JPEG"
          alt={`${t.hero.bride} & ${t.hero.groom}`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Legibility scrims: a light veil under the header, and a stronger one
          rising from the bottom to seat the text over the bright shirts. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-noir/70 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-noir via-noir/80 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-noir to-transparent"
      />
      <div
        aria-hidden
        className="absolute left-1/2 bottom-[20%] h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-gold/[0.05] blur-[120px]"
      />

      {/* Scroll-linked fade to black */}
      <motion.div aria-hidden style={{ opacity: veil }} className="absolute inset-0 bg-noir" />

      {/* Bottom hairline to meet the next section */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
      />

      {/* Content — anchored to the lower third so it never covers their faces */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative flex h-full flex-col items-center justify-end px-5 pb-16 text-center [filter:drop-shadow(0_2px_12px_rgba(0,0,0,0.7))] sm:pb-20"
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex w-full max-w-3xl flex-col items-center"
        >
          <motion.div variants={item}>
            <Mark className="h-6 w-11 text-gold sm:h-7 sm:w-12" />
          </motion.div>

          <motion.p variants={item} className="mt-6 eyebrow">
            {t.hero.kicker}
          </motion.p>

          <motion.h1
            variants={nameGroup}
            className="mt-4 w-full text-balance font-serif text-4xl font-semibold leading-[1.0] text-ivory sm:text-5xl lg:text-6xl"
          >
            {renderName(t.hero.bride)}
            <motion.span
              variants={letter}
              className="mx-2 inline-block font-normal italic text-gold sm:mx-3"
            >
              {t.hero.and}
            </motion.span>
            {renderName(t.hero.groom)}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-md text-base font-light leading-relaxed text-ivory/90 sm:text-lg"
          >
            {t.hero.tagline}
          </motion.p>

          <motion.p
            variants={item}
            className="mt-5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold sm:text-xs"
          >
            {t.hero.dates}
          </motion.p>

          <motion.div variants={item} className="mt-9">
            <a href="#rsvp" className="btn-primary">
              {t.hero.cta}
            </a>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        style={{ opacity: contentOpacity }}
        className="absolute inset-x-0 bottom-5 hidden justify-center sm:flex"
      >
        <div className="flex flex-col items-center gap-2 text-ivory/50">
          <span className="text-[0.6rem] uppercase tracking-widest2">{t.hero.scroll}</span>
          <motion.span
            animate={reduce ? undefined : { scaleY: [0.35, 1, 0.35], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            className="block h-8 w-px origin-top bg-gold/60"
          />
        </div>
      </motion.div>
    </section>
  );
}
