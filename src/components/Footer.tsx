'use client';

import { useLanguage } from '@/context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="relative bg-noir text-ivory">
      <div aria-hidden className="h-px w-full bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="container-page py-16 text-center">
        <p className="font-serif text-3xl font-semibold text-ivory">
          {t.hero.bride}
          <span className="mx-2 font-normal italic text-gold">{t.hero.and}</span>
          {t.hero.groom}
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-luxe text-gold">
          {t.footer.hashtag}
        </p>
        <p className="mt-6 text-sm font-light text-ivory-dim">{t.footer.madeWith}</p>
        <p className="mt-2 text-xs text-ivory-dim/40">
          © {t.hero.dates.split('·').pop()?.trim()} — {t.hero.bride} &amp; {t.hero.groom}
        </p>
      </div>
    </footer>
  );
}
