import { Mark } from '@/components/Mark';
import { COUPLE } from '@/lib/brand';

/**
 * The couple's signature under a photo — the same band the downloaded
 * keepsake carries: union mark, names, place & date, and who took it.
 */
export function FrameBand({
  line,
  by,
  compact = false,
}: {
  line: string;
  by?: string | null;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <Mark className={compact ? 'h-3.5 w-6 text-gold' : 'h-5 w-8 text-gold'} />
      <p
        className={`font-serif italic text-ivory ${
          compact ? 'mt-0.5 text-lg leading-tight' : 'mt-1 text-2xl'
        }`}
      >
        {COUPLE}
      </p>
      <p
        className={`font-semibold uppercase text-gold ${
          compact ? 'mt-0.5 text-[0.55rem] tracking-[0.28em]' : 'mt-1.5 text-[0.65rem] tracking-[0.32em]'
        }`}
      >
        {line}
      </p>
      {by && (
        <p className={`text-ivory-dim ${compact ? 'mt-0.5 text-[0.65rem]' : 'mt-1.5 text-xs'}`}>{by}</p>
      )}
    </div>
  );
}
