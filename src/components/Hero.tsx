'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export function Hero() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-cream pt-16 sm:pt-20"
    >
      {/* Warm textile-inspired backdrop */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-sand-100 via-cream to-sand-200" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-ochre/25 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-kente-green/20 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute inset-x-0 bottom-0 h-2 bg-kente-band opacity-80" />
      </div>

      <div className="container-page relative">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
          {/* Text column */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="order-2 text-center md:order-1 md:text-left"
          >
            <motion.p
              variants={item}
              className="font-script text-3xl text-terracotta sm:text-4xl"
            >
              {t.hero.kicker}
            </motion.p>

            <motion.h1
              variants={item}
              className="mt-2 font-serif text-5xl font-semibold leading-[1.05] text-ink sm:text-6xl lg:text-7xl"
            >
              {t.hero.bride}
              <span className="mx-3 font-script text-4xl text-ochre sm:text-5xl">
                {t.hero.and}
              </span>
              {t.hero.groom}
            </motion.h1>

            <motion.p
              variants={item}
              className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-ink/70 md:mx-0"
            >
              {t.hero.tagline}
            </motion.p>

            <motion.p
              variants={item}
              className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-terracotta"
            >
              {t.hero.dates}
            </motion.p>

            <motion.div variants={item} className="mt-8">
              <a href="#rsvp" className="btn-primary">
                {t.hero.cta}
              </a>
            </motion.div>
          </motion.div>

          {/* Photo column */}
          <motion.div
            initial={{ opacity: 0, scale: reduce ? 1 : 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 md:order-2"
          >
            <div className="relative mx-auto max-w-sm md:max-w-none">
              <div className="absolute -inset-3 rotate-[-3deg] rounded-[2rem] bg-kente-band opacity-90" />
              <div className="relative overflow-hidden rounded-[1.75rem] border-4 border-cream shadow-xl">
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
        transition={{ delay: 1.2 }}
        className="absolute inset-x-0 bottom-6 hidden justify-center sm:flex"
      >
        <div className="flex flex-col items-center gap-2 text-ink/50">
          <span className="text-xs uppercase tracking-[0.2em]">{t.hero.scroll}</span>
          <motion.span
            animate={reduce ? undefined : { y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="block h-8 w-px bg-ink/30"
          />
        </div>
      </motion.div>
    </section>
  );
}
