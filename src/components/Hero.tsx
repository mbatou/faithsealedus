'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Mark } from './Mark';

export function Hero() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.16, delayChildren: 0.15 } },
  };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-noir pt-20 sm:pt-24"
    >
      {/* Candlelit glow on pure black */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute left-[60%] top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-gold/[0.09] blur-[130px] animate-flicker" />
      </div>

      {/* Vertical edge label */}
      <span className="absolute right-4 top-1/2 hidden -translate-y-1/2 lg:block">
        <span className="v-label">Accra · Dakar — MMXXVI</span>
      </span>

      <div className="container-page relative">
        <div className="grid items-center gap-12 md:grid-cols-12">
          {/* Text column */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="order-2 md:order-1 md:col-span-7"
          >
            <motion.div variants={item} className="flex items-center gap-3">
              <span className="index-num">N°01</span>
              <span aria-hidden className="h-px w-10 bg-gold/40" />
              <span className="eyebrow">{t.hero.kicker}</span>
            </motion.div>

            <motion.h1
              variants={item}
              className="mt-8 font-serif text-[3.4rem] font-semibold leading-[0.95] text-ivory sm:text-7xl lg:text-8xl"
            >
              {t.hero.bride}
              <span className="my-1 flex items-center gap-4 text-gold">
                <Mark className="h-7 w-12 sm:h-9 sm:w-16" />
                <span className="font-normal italic">{t.hero.and}</span>
              </span>
              {t.hero.groom}
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-9 max-w-md text-lg font-light leading-relaxed text-ivory-dim"
            >
              {t.hero.tagline}
            </motion.p>

            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4"
            >
              <a href="#rsvp" className="btn-primary">
                {t.hero.cta}
              </a>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                {t.hero.dates}
              </p>
            </motion.div>
          </motion.div>

          {/* Photo column — offset gold hairline frame */}
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="order-1 md:order-2 md:col-span-5"
          >
            <div className="relative mx-auto max-w-xs sm:max-w-sm md:max-w-none">
              {/* offset frame */}
              <span
                aria-hidden
                className="absolute -bottom-3 -right-3 h-full w-full border border-gold/40"
              />
              <div className="relative overflow-hidden ring-1 ring-gold/25">
                <Image
                  src="/couple-placeholder.svg"
                  alt={`${t.hero.bride} & ${t.hero.groom}`}
                  width={900}
                  height={1100}
                  priority
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute inset-x-0 bottom-6 hidden justify-center sm:flex"
      >
        <div className="flex flex-col items-center gap-2 text-ivory-dim/50">
          <span className="text-[0.6rem] uppercase tracking-widest2">{t.hero.scroll}</span>
          <motion.span
            animate={reduce ? undefined : { scaleY: [0.35, 1, 0.35], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            className="block h-10 w-px origin-top bg-gold/60"
          />
        </div>
      </motion.div>
    </section>
  );
}
