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

  // Play as automatically as browsers allow: attempt immediately on load, and
  // if the browser blocks it, start on the very first interaction — including
  // the first scroll swipe on mobile (touchend grants user activation).
  // Guests who explicitly switched it off stay opted out.
  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) === 'off') return;

    let started = false;
    const kick = () => {
      if (started || !audioRef.current || !audioRef.current.paused) return;
      cleanup();
      started = true;
      void play().then(() => {
        // If the browser still refused (no real activation yet), re-arm.
        if (audioRef.current?.paused) {
          started = false;
          arm();
        }
      });
    };
    const events: (keyof WindowEventMap)[] = [
      'pointerdown',
      'keydown',
      'touchend',
      'click',
    ];
    const arm = () =>
      events.forEach((e) => window.addEventListener(e, kick, { passive: true }));
    const cleanup = () =>
      events.forEach((e) => window.removeEventListener(e, kick));

    // 1. Immediate attempt (succeeds for browsers that already trust the site).
    void play();
    // 2. Retry when the tab becomes visible again.
    const onVisible = () => {
      if (document.visibilityState === 'visible' && audioRef.current?.paused) {
        void play();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    // 3. First interaction anywhere.
    arm();

    return () => {
      cleanup();
      document.removeEventListener('visibilitychange', onVisible);
    };
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
        {/* Soft pulsing ring drawing the eye until the music starts */}
        {!playing && (
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full border border-gold/50 motion-reduce:hidden"
            style={{ animationDuration: '2.2s' }}
          />
        )}
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
