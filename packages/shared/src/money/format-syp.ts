import type { SYP } from '../common';

/** 1234567 -> "1,234,567 ل.س" */
export function formatSYP(amount: SYP): string {
  return `${Math.round(amount).toLocaleString('en-US')} ل.س`;
}
