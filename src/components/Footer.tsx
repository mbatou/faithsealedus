'use client';

import { useLanguage } from '@/context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="relative bg-ink text-cream">
      <div aria-hidden className="h-2 w-full bg-kente-band" />
      <div className="container-page py-12 text-center">
        <p className="font-serif text-3xl font-semibold">
          {t.hero.bride}
          <span className="mx-2 font-script text-ochre-light">{t.hero.and}</span>
          {t.hero.groom}
        </p>
        <p className="mt-3 font-script text-2xl text-ochre-light">
          {t.footer.hashtag}
        </p>
        <p className="mt-4 text-sm text-cream/60">{t.footer.madeWith}</p>
        <p className="mt-1 text-xs text-cream/40">
          © {t.hero.dates.split('·').pop()?.trim()} — {t.hero.bride} &amp; {t.hero.groom}
        </p>
      </div>
    </footer>
  );
}
