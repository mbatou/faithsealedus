'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import type { Language } from '@/lib/dictionary';
import type { MealId } from '@/lib/meals';
import { Mark, MarkDivider } from '@/components/Mark';
import { AddToCalendar } from '@/components/AddToCalendar';

const MADERA_MAP_URL =
  'https://www.google.com/maps/place/Maison+Madera+-+Restaurant+Sp%C3%A9cialis%C3%A9+en+viande,+Brunch+%26+Espaces+Privatifs/@14.7418477,-17.5205286,17z/data=!3m1!4b1!4m6!3m5!1s0xec11350b3fe19ed:0x3ac40d9aece74202!8m2!3d14.7418477!4d-17.5205286!16s%2Fg%2F11ykkpxdz0';

type Status = 'idle' | 'submitting' | 'success';

function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();
  const options: Language[] = ['en', 'fr'];
  return (
    <div
      className="flex items-center rounded-full border border-gold/25 bg-black/50 p-0.5 text-sm backdrop-blur"
      role="group"
      aria-label={t.nav.langLabel}
    >
      {options.map((option) => {
        const active = lang === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLang(option)}
            aria-pressed={active}
            className={`rounded-full px-3 py-1 font-semibold uppercase tracking-wide transition ${
              active ? 'bg-gold text-noir' : 'text-ivory-dim hover:text-ivory'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function MenuPage() {
  const { t } = useLanguage();
  const m = t.menu;

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [meal, setMeal] = useState<MealId | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();

    if (!name) return setError(m.errorName);
    if (!meal) return setError(m.errorMeal);

    setStatus('submitting');
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name,
          meal,
          allergies: String(data.get('allergies') ?? ''),
          company: String(data.get('company') ?? ''), // honeypot
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        if (payload.error === 'invalid_name') setError(m.errorName);
        else if (payload.error === 'invalid_meal') setError(m.errorMeal);
        else if (payload.error === 'rate_limited') setError(m.errorRate);
        else if (payload.error === 'not_configured') setError(m.errorConfig);
        else setError(m.errorGeneric);
        setStatus('idle');
        return;
      }

      form.reset();
      setMeal(null);
      setStatus('success');
    } catch {
      setError(m.errorGeneric);
      setStatus('idle');
    }
  }

  return (
    <main className="min-h-screen bg-noir text-ivory">
      <header className="container-page flex h-16 items-center justify-between sm:h-20">
        <a
          href="/"
          className="font-serif text-xl font-semibold tracking-[0.2em] text-ivory"
        >
          A <span className="text-gold">&amp;</span> G
        </a>
        <LanguageToggle />
      </header>

      <section className="container-page pb-24 pt-10 sm:pt-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <Mark className="h-7 w-12 text-gold" />
          <p className="eyebrow mt-8">{m.kicker}</p>
          <h1 className="mt-5 font-serif text-[2.1rem] font-semibold leading-[1.05] text-ivory sm:text-5xl">
            {m.title}
          </h1>
          <p className="mt-4 font-serif text-base italic text-gold sm:text-lg">
            {m.place}
          </p>
          <MarkDivider className="mt-7" />
          <p className="mt-7 max-w-xl text-base font-light leading-relaxed text-ivory-dim">
            {m.intro}
          </p>
        </div>

        {/* The venue */}
        <figure className="mx-auto mt-12 max-w-2xl">
          <div className="border border-gold/20 p-1.5 sm:p-2">
            <Image
              src="/maison-madera.webp"
              alt={m.photoAlt}
              width={900}
              height={500}
              className="h-auto w-full"
              priority
            />
          </div>
          <figcaption className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <span className="text-sm font-light text-ivory-dim">{m.address}</span>
            <a
              href={MADERA_MAP_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost shrink-0"
            >
              {t.week.labels.map}
            </a>
          </figcaption>
        </figure>

        {/* The programme of the evening */}
        <div className="mx-auto mt-14 max-w-xl">
          <p className="eyebrow text-center">{m.programme.label}</p>
          <ol className="card mt-6 divide-y divide-gold/10 px-6 py-2 sm:px-8">
            {m.programme.items.map((item) => (
              <li key={item.time} className="flex items-baseline gap-5 py-4">
                <span className="w-16 shrink-0 font-serif text-base italic text-gold">
                  {item.time}
                </span>
                <span className="text-sm font-light leading-relaxed text-ivory-dim sm:text-base">
                  {item.title}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mx-auto mt-12 max-w-xl">
          <div className="card p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="py-6 text-center"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center border border-gold/30 text-3xl">
                    🍽️
                  </div>
                  <h2 className="mt-6 font-serif text-2xl font-semibold text-ivory">
                    {m.successTitle}
                  </h2>
                  <p className="mt-3 font-light text-ivory-dim">{m.successBody}</p>
                  <AddToCalendar events={['dinner']} />
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="btn-ghost mt-6"
                  >
                    {m.another}
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-6"
                >
                  {/* Honeypot — hidden from humans, tempting to bots. */}
                  <div className="sr-only-field" aria-hidden>
                    <label htmlFor="company">Company</label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="field-label">
                      {m.nameLabel}
                    </label>
                    <input id="name" name="name" type="text" required className="field-input" />
                  </div>

                  <fieldset>
                    <legend className="field-label">{m.mealLabel}</legend>
                    <div className="mt-2 space-y-3">
                      {m.options.map((option, i) => {
                        const active = meal === option.id;
                        return (
                          <label
                            key={option.id}
                            className={`flex cursor-pointer items-start gap-4 border px-5 py-4 transition ${
                              active
                                ? 'border-gold/70 bg-gold/5'
                                : 'border-gold/15 hover:border-gold/45'
                            }`}
                          >
                            <input
                              type="radio"
                              name="meal"
                              value={option.id}
                              checked={active}
                              onChange={() => setMeal(option.id)}
                              className="mt-1 h-5 w-5 accent-gold"
                            />
                            <span>
                              <span className="flex items-baseline gap-3">
                                <span className="index-num">
                                  {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="font-serif text-lg font-semibold leading-snug text-ivory">
                                  {option.title}
                                </span>
                              </span>
                              <span className="mt-1 block text-sm font-light text-ivory-dim">
                                {option.desc}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div>
                    <label htmlFor="allergies" className="field-label">
                      {m.allergiesLabel}
                    </label>
                    <input
                      id="allergies"
                      name="allergies"
                      type="text"
                      placeholder={m.allergiesPlaceholder}
                      className="field-input"
                    />
                  </div>

                  {error && (
                    <p className="border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="btn-primary w-full"
                  >
                    {status === 'submitting' ? m.submitting : m.submit}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-10 text-center font-serif text-sm italic text-ivory-dim/50">
            {t.footer.closing}
          </p>
        </div>
      </section>
    </main>
  );
}
