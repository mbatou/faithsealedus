'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Mark } from './Mark';

export function Footer() {
  const { t } = useLanguage();
  const year = t.hero.dates.match(/\d{4}/)?.[0] ?? '2026';
  return (
    <footer className="relative bg-noir text-ivory">
      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-transparent via-gold/50 to-transparent"
      />
      <div className="container-page flex flex-col items-center py-16 text-center">
        <Mark className="h-6 w-11 text-gold" />
        <p className="mt-6 font-serif text-3xl font-semibold text-ivory sm:text-4xl">
          {t.hero.bride}
          <span className="mx-2 font-normal italic text-gold">{t.hero.and}</span>
          {t.hero.groom}
        </p>
        <p className="mt-5 font-serif text-lg italic text-gold">{t.footer.closing}</p>
        <p className="mt-6 text-xs text-ivory-dim/50">
          © {year} — {t.hero.bride} &amp; {t.hero.groom}
        </p>
      </div>
    </footer>
  );
}
