'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { MarkDivider } from './Mark';

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
    <section className="section-pad relative overflow-hidden bg-noir">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.07] blur-[110px] animate-flicker" />
      </div>

      <div className="container-page relative flex flex-col items-center text-center">
        <p className="eyebrow">{t.countdown.kicker}</p>
        <h2 className="mt-5 font-serif text-3xl font-semibold text-ivory sm:text-4xl md:text-5xl">
          {t.countdown.title}
        </h2>
        <MarkDivider className="mt-7" />
        <p className="mt-6 text-xs uppercase tracking-[0.22em] text-gold">
          {t.countdown.to}
        </p>

        {timeLeft?.done ? (
          <p className="mt-12 font-serif text-2xl italic text-gold sm:text-3xl">
            {t.countdown.passed}
          </p>
        ) : (
          <div className="mx-auto mt-12 grid w-full max-w-lg grid-cols-4 gap-px border border-gold/15 bg-gold/15">
            {units.map((unit, i) => (
              <motion.div
                key={unit.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="bg-noir py-6 sm:py-8"
              >
                <div className="font-serif text-3xl font-semibold tabular-nums text-gold sm:text-5xl">
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="mt-2 text-[0.55rem] uppercase tracking-[0.2em] text-ivory-dim/60 sm:text-xs">
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
