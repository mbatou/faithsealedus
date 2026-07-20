'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const TRACK = '/canon-in-d.mp3';
const TARGET_VOLUME = 0.35;
const STORAGE_KEY = 'wedding-music';

/**
 * Floating background-music control (Canon in D).
 *
 * Browsers block autoplay with sound, so the music starts on the guest's
 * first interaction with the page — unless they previously switched it off
 * (remembered in localStorage). The toggle pauses/resumes at any time, and
 * play always fades in gently.
 */
export function MusicToggle() {
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);

  function fadeIn(audio: HTMLAudioElement) {
    if (fadeRef.current) window.clearInterval(fadeRef.current);
    audio.volume = 0;
    fadeRef.current = window.setInterval(() => {
      const next = Math.min(TARGET_VOLUME, audio.volume + 0.03);
      audio.volume = next;
      if (next >= TARGET_VOLUME && fadeRef.current) {
        window.clearInterval(fadeRef.current);
        fadeRef.current = null;
      }
    }, 120);
  }

  async function play() {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      fadeIn(audio);
      await audio.play();
      setPlaying(true);
      window.localStorage.setItem(STORAGE_KEY, 'on');
    } catch {
      // Autoplay refused — stay paused until the guest uses the toggle.
      if (fadeRef.current) window.clearInterval(fadeRef.current);
    }
  }

  function pause() {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRef.current) window.clearInterval(fadeRef.current);
    audio.pause();
    setPlaying(false);
    window.localStorage.setItem(STORAGE_KEY, 'off');
  }

  // Start on the first interaction anywhere, unless the guest opted out before.
  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) === 'off') return;

    let started = false;
    const kick = () => {
      if (started) return;
      started = true;
      cleanup();
      void play();
    };
    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'touchstart'];
    const cleanup = () =>
      events.forEach((e) => window.removeEventListener(e, kick));
    events.forEach((e) => window.addEventListener(e, kick, { passive: true }));
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={TRACK} loop preload="metadata" />

      <motion.button
        type="button"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.9 }}
        onClick={() => (playing ? pause() : void play())}
        aria-label={playing ? t.music.pause : t.music.play}
        aria-pressed={playing}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-noir/80 backdrop-blur transition hover:border-gold hover:bg-noir focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:bottom-6 sm:right-6"
      >
        {playing ? (
          <span className="flex h-4 items-end gap-[3px]" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="eq-bar block h-full w-[3px] rounded-full bg-gold"
                style={{ ['--eq-delay' as string]: `${i * 0.18}s` }}
              />
            ))}
          </span>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-gold"
            aria-hidden
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        )}
      </motion.button>
    </>
  );
}
