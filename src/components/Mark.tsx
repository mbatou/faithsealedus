import type { SVGProps } from 'react';

/**
 * Signature "union" mark — two interlocked rings framing a central node.
 * Two people, two countries, one celebration. Used as the recurring motif
 * (dividers, hero, footer) in place of a generic flourish.
 */
export function Mark({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className={className}
      aria-hidden
      {...props}
    >
      <circle cx="26" cy="20" r="13" />
      <circle cx="38" cy="20" r="13" />
      <path d="M32 12.6a13 13 0 010 14.8" opacity="0.55" />
    </svg>
  );
}

/**
 * Horizontal divider: a hairline that fades in from both sides toward the
 * central union mark.
 */
export function MarkDivider({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center justify-center gap-4 ${className}`} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
      <Mark className="h-5 w-8 text-gold" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
    </span>
  );
}
