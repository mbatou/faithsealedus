'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';

interface Prayer {
  id: string;
  name: string | null;
  message: string;
  created_at: string;
}

function sizeClass(len: number): string {
  if (len <= 28) return 'text-2xl sm:text-3xl text-ivory';
  if (len <= 80) return 'text-lg sm:text-xl text-ivory/90';
  return 'text-base sm:text-lg text-ivory-dim';
}

export function Prayers() {
  const { t } = useLanguage();
  const p = t.prayers;
  const reduce = useReducedMotion();

  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
  const [thanks, setThanks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newId, setNewId] = useState<string | null>(null);
  const companyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/prayers')
      .then((r) => r.json())
      .then((d) => {
        if (alive) {
          setPrayers(Array.isArray(d.prayers) ? d.prayers : []);
          setLoaded(true);
        }
      })
      .catch(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const msg = message.trim();
    if (msg.length < 2) return;
    setStatus('submitting');
    setError(null);
    try {
      const res = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          name: name.trim(),
          company: companyRef.current?.value ?? '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error === 'not_configured' ? p.errorConfig : p.error);
        setStatus('idle');
        return;
      }
      if (data.prayer) {
        setPrayers((prev) => [data.prayer as Prayer, ...prev]);
        setNewId(data.prayer.id);
      }
      setMessage('');
      setName('');
      setThanks(true);
      setStatus('idle');
      window.setTimeout(() => setThanks(false), 4500);
    } catch {
      setError(p.error);
      setStatus('idle');
    }
  }

  const cloud = prayers.slice(0, 60);

  return (
    <section id="prayers" className="section-pad bg-noir">
      <div className="container-page">
        <SectionHeading kicker={p.kicker} title={p.title} intro={p.intro} />

        {/* The cloud */}
        <div className="mt-14 min-h-[120px]">
          {loaded && cloud.length === 0 ? (
            <p className="text-center font-serif text-lg italic text-ivory-dim">
              {p.empty}
            </p>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-9 sm:gap-y-4">
              <AnimatePresence initial={false}>
                {cloud.map((pr, i) => {
                  const highlighted = pr.id === newId;
                  return (
                    <motion.span
                      key={pr.id}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{
                        duration: 0.8,
                        delay: reduce ? 0 : Math.min(i * 0.02, 0.6),
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="inline-flex max-w-[15rem] items-baseline sm:max-w-xs"
                    >
                      <span
                        className={`font-serif italic leading-snug ${
                          highlighted ? 'text-2xl text-gold sm:text-3xl' : sizeClass(pr.message.length)
                        }`}
                        style={
                          reduce
                            ? undefined
                            : {
                                animation: 'floaty ease-in-out infinite',
                                animationDuration: `${6 + (i % 5)}s`,
                                animationDelay: `${(i % 7) * 0.4}s`,
                              }
                        }
                      >
                        “{pr.message}”
                        {pr.name && (
                          <span className="ml-2 whitespace-nowrap font-sans text-[0.6rem] not-italic uppercase tracking-[0.15em] text-gold/70">
                            {p.signed} {pr.name}
                          </span>
                        )}
                      </span>
                    </motion.span>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Add a prayer */}
        <Reveal className="mx-auto mt-16 max-w-xl">
          <form onSubmit={submit} className="card p-6 sm:p-7">
            <div className="sr-only-field" aria-hidden>
              <label htmlFor="prayer-company">Company</label>
              <input id="prayer-company" ref={companyRef} tabIndex={-1} autoComplete="off" />
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              maxLength={280}
              aria-label={p.placeholder}
              placeholder={p.placeholder}
              className="field-input resize-none"
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                aria-label={p.namePlaceholder}
                placeholder={p.namePlaceholder}
                className="field-input"
              />
              <button
                type="submit"
                disabled={status === 'submitting' || message.trim().length < 2}
                className="btn-primary shrink-0"
              >
                {status === 'submitting' ? p.submitting : p.submit}
              </button>
            </div>

            {error && (
              <p className="mt-3 rounded-none border border-red-400/25 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                {error}
              </p>
            )}
            <AnimatePresence>
              {thanks && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 text-center font-serif text-lg italic text-gold"
                >
                  {p.thanks}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
