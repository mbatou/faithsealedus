'use client';

import Link from 'next/link';
import { LanguageToggle } from '@/components/Header';

/** Slim header for the stand-alone photo pages (/share, /gallery). */
export function MiniHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gold/10 bg-noir/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-xl font-semibold tracking-[0.2em] text-ivory">
          A <span className="text-gold">&amp;</span> G
        </Link>
        <LanguageToggle />
      </div>
    </header>
  );
}
