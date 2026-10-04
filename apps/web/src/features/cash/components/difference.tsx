import { formatSYP } from '@carwash/shared';

/** "مطابق", "عجز 5,000 ل.س" (short) or "زيادة 5,000 ل.س" (extra). */
export function differenceLabel(difference: number): string {
  if (difference === 0) return 'مطابق';
  return difference < 0 ? `عجز ${formatSYP(-difference)}` : `زيادة ${formatSYP(difference)}`;
}

export function DifferenceText({ value }: { value: number }) {
  const tone =
    value === 0 ? 'text-status-done' : value < 0 ? 'text-status-grace' : 'text-status-washing';
  return <span className={`font-semibold tabular-nums ${tone}`}>{differenceLabel(value)}</span>;
}
