'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { SectionHeading } from './SectionHeading';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function computeTimeLeft(target: number): TimeLeft {
  const diff = target - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds, done: false };
}

export function Countdown() {
  const { t } = useLanguage();
  const targetTime = useMemo(
    () => new Date(t.week.events[0].isoDate).getTime(),
    [t.week.events],
  );

  // Start null to keep SSR and first client render identical, then tick.
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(computeTimeLeft(targetTime));
    const id = setInterval(() => setTimeLeft(computeTimeLeft(targetTime)), 1000);
    return () => clearInterval(id);
  }, [targetTime]);

  const units = timeLeft
    ? [
        { label: t.countdown.days, value: timeLeft.days },
        { label: t.countdown.hours, value: timeLeft.hours },
        { label: t.countdown.minutes, value: timeLeft.minutes },
        { label: t.countdown.seconds, value: timeLeft.seconds },
      ]
    : [
        { label: t.countdown.days, value: 0 },
        { label: t.countdown.hours, value: 0 },
        { label: t.countdown.minutes, value: 0 },
        { label: t.countdown.seconds, value: 0 },
      ];

  return (
    <section className="section-pad relative overflow-hidden bg-indigo-deep text-cream">
      <div aria-hidden className="absolute inset-x-0 top-0 h-2 bg-kente-band" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-2 bg-kente-band" />

      <div className="container-page relative text-center">
        <p className="font-script text-3xl text-ochre-light">{t.countdown.kicker}</p>
        <h2 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl md:text-5xl">
          {t.countdown.title}
        </h2>
        <p className="mt-3 text-sm uppercase tracking-[0.2em] text-cream/60">
          {t.countdown.to}
        </p>

        {timeLeft?.done ? (
          <p className="mt-10 font-serif text-2xl text-ochre-light sm:text-3xl">
            {t.countdown.passed}
          </p>
        ) : (
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 gap-3 sm:gap-5">
            {units.map((unit, i) => (
              <motion.div
                key={unit.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="rounded-2xl border border-cream/15 bg-white/5 py-4 backdrop-blur sm:py-6"
              >
                <div className="font-serif text-3xl font-semibold tabular-nums sm:text-5xl">
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="mt-1 text-[0.65rem] uppercase tracking-[0.15em] text-cream/60 sm:text-xs">
                  {unit.label}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
