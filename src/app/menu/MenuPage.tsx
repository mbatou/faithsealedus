'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageToggle } from '@/components/Header';
import { Mark, MarkDivider } from '@/components/Mark';
import { AddToCalendar } from '@/components/AddToCalendar';

const MADERA_MAP_URL =
  'https://www.google.com/maps/place/Maison+Madera+-+Restaurant+Sp%C3%A9cialis%C3%A9+en+viande,+Brunch+%26+Espaces+Privatifs/@14.7418477,-17.5205286,17z/data=!3m1!4b1!4m6!3m5!1s0xec11350b3fe19ed:0x3ac40d9aece74202!8m2!3d14.7418477!4d-17.5205286!16s%2Fg%2F11ykkpxdz0';

// Portraits of the couple on a dark studio backdrop: they melt into the page.
const BACKDROPS = [
  { src: '/faithsealedus2.PNG', pos: '50% 30%' },
  { src: '/faithsealedus1.PNG', pos: '50% 25%' },
  { src: '/faithsealedus6.PNG', pos: '50% 20%' },
  { src: '/faithsealedus5.PNG', pos: '50% 30%' },
];
const SLIDE_MS = 7000;

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
} as const;

/** Slow cross-fading portraits behind the welcome, with a gentle zoom. */
function Backdrop() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % BACKDROPS.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={i}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: reduce ? 1.04 : 1.14 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 2.2, ease: 'easeInOut' },
            scale: { duration: SLIDE_MS / 1000 + 2.2, ease: 'linear' },
          }}
        >
          <Image
            src={BACKDROPS[i].src}
            alt=""
            fill
            sizes="100vw"
            priority={i === 0}
            className="object-cover"
            style={{ objectPosition: BACKDROPS[i].pos }}
          />
        </motion.div>
      </AnimatePresence>
      {/* Keep the words legible: darken, then fade into the page below. */}
      <div className="absolute inset-0 bg-noir/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-noir/75 via-transparent to-noir" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-noir to-transparent" />
    </div>
  );
}

export function MenuPage() {
  const { t } = useLanguage();
  const m = t.menu;

  return (
    <main className="min-h-screen overflow-x-hidden bg-noir text-ivory">
      {/* ─── Welcome ─────────────────────────────────────────────── */}
      <section className="relative flex min-h-[100svh] flex-col">
        <Backdrop />

        <header className="container-page relative z-10 flex h-16 items-center justify-between sm:h-20">
          <a href="/" className="font-serif text-xl font-semibold tracking-[0.2em] text-ivory">
            A <span className="text-gold">&amp;</span> G
          </a>
          <LanguageToggle />
        </header>

        <div className="container-page relative z-10 flex flex-1 flex-col items-center justify-center pb-16 pt-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <Mark className="h-7 w-12 text-gold" />
            <p className="eyebrow mt-7">{m.kicker}</p>
            <h1 className="mt-5 font-serif text-[2.6rem] font-semibold leading-[1.02] text-ivory drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)] sm:text-6xl">
              {m.title}
            </h1>
            <p className="mt-4 font-serif text-base italic text-gold sm:text-lg">{m.place}</p>
          </motion.div>

          {/* The time, impossible to miss. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-10 w-full max-w-sm"
          >
            <div className="border border-gold/60 bg-noir/55 p-1.5 shadow-[0_0_60px_rgba(198,161,91,0.18)] backdrop-blur-md">
              <div className="border border-gold/25 px-6 py-7">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-gold">
                  {m.startsLabel}
                </p>
                <p className="mt-3 font-serif text-6xl font-semibold leading-none text-ivory sm:text-7xl">
                  {m.startsTime}
                </p>
                <p className="mt-4 text-sm font-light uppercase tracking-[0.18em] text-ivory-dim">
                  {m.startsDate}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.7 }}
            className="mt-8 max-w-md text-base font-light leading-relaxed text-ivory/90"
          >
            {m.startsNote}
          </motion.p>
        </div>

        <div aria-hidden className="relative z-10 flex justify-center pb-8">
          <span className="block h-10 w-px animate-pulse bg-gradient-to-b from-gold/70 to-transparent" />
        </div>
      </section>

      {/* ─── A word from us ──────────────────────────────────────── */}
      <section className="container-page pb-6 pt-8">
        <motion.div {...reveal} className="mx-auto max-w-xl text-center">
          <MarkDivider />
          <p className="mt-8 font-serif text-xl italic leading-relaxed text-ivory sm:text-2xl">
            {m.intro}
          </p>
          <p className="mt-5 font-serif text-lg text-gold">— Augusta &amp; Georges</p>
        </motion.div>
      </section>

      {/* ─── The programme ───────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28">
        <div aria-hidden className="absolute inset-0">
          <Image
            src="/faithsealedus8.PNG"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.13]"
            style={{ objectPosition: '50% 35%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-noir via-noir/40 to-noir" />
        </div>

        <div className="container-page relative">
          <motion.div {...reveal} className="text-center">
            <p className="eyebrow">{m.programme.label}</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold text-ivory sm:text-4xl">
              {m.programme.title}
            </h2>
          </motion.div>

          <ol className="relative mx-auto mt-14 max-w-xl">
            {/* The thread running through the evening */}
            <span
              aria-hidden
              className="absolute bottom-3 left-[5.25rem] top-3 w-px bg-gradient-to-b from-gold via-gold/40 to-gold/10 sm:left-[6.25rem]"
            />
            {m.programme.items.map((item, i) => {
              const first = i === 0;
              return (
                <motion.li
                  key={item.time}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex gap-8 pb-9 last:pb-0 sm:gap-10"
                >
                  <span
                    className={`w-[4.25rem] shrink-0 pt-0.5 text-right font-serif italic sm:w-20 ${
                      first ? 'text-xl font-semibold text-gold' : 'text-base text-gold/85'
                    }`}
                  >
                    {item.time}
                  </span>
                  <span
                    aria-hidden
                    className={`absolute top-2 left-[5.25rem] -translate-x-1/2 rotate-45 sm:left-[6.25rem] ${
                      first
                        ? 'h-3 w-3 bg-gold shadow-[0_0_14px_rgba(198,161,91,0.8)]'
                        : 'h-2 w-2 border border-gold bg-noir'
                    }`}
                  />
                  <span className="pl-1">
                    <span
                      className={`block font-serif font-medium leading-snug text-ivory ${
                        first ? 'text-xl' : 'text-lg'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm font-light leading-relaxed text-ivory-dim">
                      {item.detail}
                    </span>
                  </span>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ─── At the table ────────────────────────────────────────── */}
      <section className="container-page pb-20">
        <motion.div {...reveal} className="card mx-auto max-w-xl px-6 py-10 text-center sm:px-10">
          <p className="text-3xl" aria-hidden>
            🍽️
          </p>
          <p className="eyebrow mt-5">{m.tableKicker}</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-ivory sm:text-3xl">
            {m.tableTitle}
          </h2>
          <p className="mt-4 font-light leading-relaxed text-ivory-dim">{m.tableBody}</p>
        </motion.div>
      </section>

      {/* ─── The place ───────────────────────────────────────────── */}
      <section className="container-page pb-20">
        <motion.figure {...reveal} className="mx-auto max-w-2xl">
          <p className="eyebrow mb-6 text-center">{m.venueKicker}</p>
          <div className="border border-gold/20 p-1.5 sm:p-2">
            <Image
              src="/maison-madera.webp"
              alt={m.photoAlt}
              width={900}
              height={500}
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <span className="text-center text-sm font-light text-ivory-dim sm:text-left">
              {m.address}
              <span className="mx-2 text-gold/50">·</span>
              <span className="font-semibold text-gold">{m.startsTime}</span>
            </span>
            <a href={MADERA_MAP_URL} target="_blank" rel="noreferrer" className="btn-ghost shrink-0">
              {t.week.labels.map}
            </a>
          </figcaption>
          <div className="mx-auto max-w-md">
            <AddToCalendar events={['dinner']} />
          </div>
        </motion.figure>
      </section>

      {/* ─── Until Saturday ──────────────────────────────────────── */}
      <section className="container-page pb-24 text-center">
        <motion.div {...reveal} className="mx-auto flex max-w-xl flex-col items-center">
          <Mark className="h-6 w-10 text-gold/80" />
          <h2 className="mt-6 font-serif text-3xl font-semibold text-ivory sm:text-4xl">
            {m.closingTitle}
          </h2>
          <p className="mt-4 font-light text-ivory-dim">{m.closingBody}</p>
          <p className="mt-14 font-serif text-sm italic text-ivory-dim/50">{t.footer.closing}</p>
        </motion.div>
      </section>
    </main>
  );
}
