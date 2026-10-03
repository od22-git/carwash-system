import type { SYP } from '../common';

/** 1234567 -> "1,234,567 ل.س". Never prints "-0" (a negated zero sum is just 0). */
export function formatSYP(amount: SYP): string {
  const rounded = Math.round(amount) || 0;
  return `${rounded.toLocaleString('en-US')} ل.س`;
}
