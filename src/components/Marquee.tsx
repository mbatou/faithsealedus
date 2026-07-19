'use client';

import { Mark } from './Mark';

/**
 * Slow, continuous editorial ticker. Content is duplicated so the -50%
 * keyframe loops seamlessly. Purely decorative.
 */
export function Marquee({ items }: { items: string[] }) {
  const sequence = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-gold/15 bg-noir py-4">
      <div className="flex w-max animate-marquee items-center whitespace-nowrap will-change-transform motion-reduce:animate-none">
        {sequence.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="mx-6 font-serif text-lg italic tracking-wide text-ivory-dim sm:mx-10 sm:text-xl">
              {item}
            </span>
            <Mark className="mx-2 h-4 w-7 shrink-0 text-gold/70" />
          </span>
        ))}
      </div>
    </div>
  );
}
