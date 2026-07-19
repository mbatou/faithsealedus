'use client';

import { Reveal } from './Reveal';

interface SectionHeadingProps {
  kicker: string;
  title: string;
  intro?: string;
  align?: 'center' | 'left';
}

export function SectionHeading({
  kicker,
  title,
  intro,
  align = 'center',
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <Reveal className={`max-w-2xl ${alignment}`}>
      <p className="font-script text-2xl sm:text-3xl text-terracotta">{kicker}</p>
      <h2 className="mt-1 font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-ink">
        {title}
      </h2>
      <span
        aria-hidden
        className={`mt-5 block h-1 w-24 rounded-full bg-kente-band ${
          align === 'center' ? 'mx-auto' : ''
        }`}
      />
      {intro && (
        <p className="mt-6 text-base sm:text-lg leading-relaxed text-ink/70">
          {intro}
        </p>
      )}
    </Reveal>
  );
}
