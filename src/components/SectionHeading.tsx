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
  const alignment = align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start';
  return (
    <Reveal className={`flex max-w-2xl flex-col ${alignment}`}>
      <p className="eyebrow">{kicker}</p>
      <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-ivory sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <span aria-hidden className="rule mt-6" />
      {intro && (
        <p className="mt-6 text-base leading-relaxed text-ivory-dim sm:text-lg">
          {intro}
        </p>
      )}
    </Reveal>
  );
}
