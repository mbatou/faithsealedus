'use client';

import { Reveal } from './Reveal';
import { MarkDivider } from './Mark';

interface SectionHeadingProps {
  kicker: string;
  title: string;
  intro?: string;
  index?: string;
  align?: 'center' | 'left';
}

export function SectionHeading({
  kicker,
  title,
  intro,
  index,
  align = 'center',
}: SectionHeadingProps) {
  const centered = align === 'center';
  return (
    <Reveal
      className={`flex max-w-2xl flex-col ${
        centered ? 'mx-auto items-center text-center' : 'items-start text-left'
      }`}
    >
      <div className="flex items-center gap-3">
        {index && (
          <>
            <span className="index-num">{index}</span>
            <span aria-hidden className="h-px w-8 bg-gold/40" />
          </>
        )}
        <p className="eyebrow">{kicker}</p>
      </div>

      <h2 className="mt-6 font-serif text-[2.1rem] font-semibold leading-[1.05] text-ivory sm:text-5xl md:text-6xl">
        {title}
      </h2>

      <MarkDivider className={`mt-7 ${centered ? '' : 'justify-start'}`} />

      {intro && (
        <p className="mt-7 max-w-xl text-base font-light leading-relaxed text-ivory-dim sm:text-lg">
          {intro}
        </p>
      )}
    </Reveal>
  );
}
