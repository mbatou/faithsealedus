'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { Language } from '@/lib/dictionary';

const navItems: { id: string; key: keyof ReturnType<typeof useLanguage>['t']['nav'] }[] = [
  { id: 'story', key: 'story' },
  { id: 'week', key: 'week' },
  { id: 'gallery', key: 'gallery' },
  { id: 'witnesses', key: 'witnesses' },
  { id: 'prayers', key: 'prayers' },
  { id: 'travel', key: 'travel' },
  { id: 'rsvp', key: 'rsvp' },
];

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

export function Header() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || menuOpen
          ? 'border-b border-gold/10 bg-noir/85 backdrop-blur'
          : 'bg-transparent'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between sm:h-20">
        <a href="#top" className="font-serif text-xl font-semibold tracking-[0.2em] text-ivory">
          A <span className="text-gold">&amp;</span> G
        </a>

        <nav className="hidden items-center gap-5 lg:flex lg:gap-6" aria-label="Primary">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-xs font-semibold uppercase tracking-[0.15em] text-ivory-dim transition hover:text-gold"
            >
              {t.nav[item.key]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/25 text-ivory lg:hidden"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition ${
                  menuOpen ? 'top-1.5 rotate-45' : ''
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-0.5 w-5 bg-current transition ${
                  menuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`absolute left-0 top-3 h-0.5 w-5 bg-current transition ${
                  menuOpen ? 'top-1.5 -rotate-45' : ''
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="border-t border-gold/10 bg-noir/95 backdrop-blur lg:hidden"
          aria-label="Mobile"
        >
          <ul className="container-page flex flex-col py-4">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 font-serif text-lg text-ivory/85 transition hover:text-gold"
                >
                  {t.nav[item.key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
