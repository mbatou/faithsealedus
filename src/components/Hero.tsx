'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export function Hero() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.18, delayChildren: 0.2 } },
  };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-noir pt-16 sm:pt-20"
    >
      {/* Candlelit low-light backdrop */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-noir to-noir" />
        {/* Warm glow, softly flickering like candlelight */}
        <div className="absolute left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px] animate-flicker sm:h-[48rem] sm:w-[48rem]" />
      </div>

      <div className="container-page relative">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Text column */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="order-2 text-center md:order-1 md:text-left"
          >
            <motion.p variants={item} className="eyebrow">
              {t.hero.kicker}
            </motion.p>

            <motion.h1
              variants={item}
              className="mt-6 font-serif text-5xl font-semibold leading-[1.05] text-ivory sm:text-6xl lg:text-7xl"
            >
              {t.hero.bride}
              <span className="mx-3 font-normal italic text-gold">{t.hero.and}</span>
              {t.hero.groom}
            </motion.h1>

            <motion.span
              variants={item}
              aria-hidden
              className="rule mt-8 md:mx-0"
            />

            <motion.p
              variants={item}
              className="mx-auto mt-8 max-w-md text-lg font-light leading-relaxed text-ivory-dim md:mx-0"
            >
              {t.hero.tagline}
            </motion.p>

            <motion.p
              variants={item}
              className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-gold"
            >
              {t.hero.dates}
            </motion.p>

            <motion.div variants={item} className="mt-10">
              <a href="#rsvp" className="btn-primary">
                {t.hero.cta}
              </a>
            </motion.div>
          </motion.div>

          {/* Photo column — large photo on black with a gold hairline border */}
          <motion.div
            initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 md:order-2"
          >
            <div className="relative mx-auto max-w-sm md:max-w-none">
              <div className="relative overflow-hidden rounded-sm p-2 ring-1 ring-gold/40">
                <div className="overflow-hidden rounded-sm ring-1 ring-gold/20">
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
        <div className="flex flex-col items-center gap-2 text-ivory-dim/60">
          <span className="text-[0.65rem] uppercase tracking-[0.25em]">
            {t.hero.scroll}
          </span>
          <motion.span
            animate={reduce ? undefined : { scaleY: [0.4, 1, 0.4], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="block h-8 w-px origin-top bg-gold/60"
          />
        </div>
      </motion.div>
    </section>
  );
}
