'use client';

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = 'idle' | 'submitting' | 'success';

export function Rsvp() {
  const { t } = useLanguage();
  const f = t.rsvp.fields;

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [ghana, setGhana] = useState(false);
  const [senegal, setSenegal] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();

    // Client-side guardrails (server re-validates).
    if (!name) return setError(t.rsvp.errorName);
    if (!EMAIL_RE.test(email)) return setError(t.rsvp.errorEmail);
    if (!ghana && !senegal) return setError(t.rsvp.errorAttend);

    setStatus('submitting');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          attending_ghana: ghana,
          attending_senegal: senegal,
          party_size: Number(data.get('party_size') ?? 1),
          dietary_notes: String(data.get('dietary_notes') ?? ''),
          message: String(data.get('message') ?? ''),
          company: String(data.get('company') ?? ''), // honeypot
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        if (payload.error === 'invalid_email') setError(t.rsvp.errorEmail);
        else if (payload.error === 'invalid_name') setError(t.rsvp.errorName);
        else if (payload.error === 'no_attendance') setError(t.rsvp.errorAttend);
        else setError(t.rsvp.errorGeneric);
        setStatus('idle');
        return;
      }

      form.reset();
      setGhana(false);
      setSenegal(false);
      setStatus('success');
    } catch {
      setError(t.rsvp.errorGeneric);
      setStatus('idle');
    }
  }

  return (
    <section id="rsvp" className="section-pad bg-noir">
      <div className="container-page">
        <SectionHeading index="05" kicker={t.rsvp.kicker} title={t.rsvp.title} intro={t.rsvp.intro} />

        <Reveal className="mx-auto mt-14 max-w-xl">
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
                    🕯️
                  </div>
                  <h3 className="mt-6 font-serif text-2xl font-semibold text-ivory">
                    {t.rsvp.successTitle}
                  </h3>
                  <p className="mt-3 font-light text-ivory-dim">{t.rsvp.successBody}</p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="btn-ghost mt-6"
                  >
                    {t.rsvp.another}
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
                  className="space-y-5"
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
                      {f.name}
                    </label>
                    <input id="name" name="name" type="text" required className="field-input" />
                  </div>

                  <div>
                    <label htmlFor="email" className="field-label">
                      {f.email}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="field-input"
                      aria-describedby="email-note"
                    />
                    <p id="email-note" className="mt-1.5 text-xs text-ivory-dim/50">
                      {t.rsvp.confirmationNote}
                    </p>
                  </div>

                  <fieldset className="space-y-2">
                    <legend className="field-label">{t.nav.week}</legend>
                    <label className="flex cursor-pointer items-center gap-3 border border-gold/15 px-4 py-3 transition hover:border-gold/45">
                      <input
                        type="checkbox"
                        checked={ghana}
                        onChange={(e) => setGhana(e.target.checked)}
                        className="h-5 w-5 accent-gold"
                      />
                      <span className="text-ivory-dim">{f.attendingGhana}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 border border-gold/15 px-4 py-3 transition hover:border-gold/45">
                      <input
                        type="checkbox"
                        checked={senegal}
                        onChange={(e) => setSenegal(e.target.checked)}
                        className="h-5 w-5 accent-gold"
                      />
                      <span className="text-ivory-dim">{f.attendingSenegal}</span>
                    </label>
                  </fieldset>

                  <div>
                    <label htmlFor="party_size" className="field-label">
                      {f.partySize}
                    </label>
                    <input
                      id="party_size"
                      name="party_size"
                      type="number"
                      min={1}
                      max={20}
                      defaultValue={1}
                      className="field-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="dietary_notes" className="field-label">
                      {f.dietary}
                    </label>
                    <input
                      id="dietary_notes"
                      name="dietary_notes"
                      type="text"
                      placeholder={f.dietaryPlaceholder}
                      className="field-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="field-label">
                      {f.message}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      placeholder={f.messagePlaceholder}
                      className="field-input resize-none"
                    />
                  </div>

                  {error && (
                    <p className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="btn-primary w-full"
                  >
                    {status === 'submitting' ? t.rsvp.submitting : t.rsvp.submit}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
