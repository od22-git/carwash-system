import { toLatinDigits } from '../common';

/**
 * One way of writing a plate, so search and duplicate checks work:
 * Latin digits, single spaces, capital Latin letters. "حلب  ١٢٣٤٥٦" -> "حلب 123456".
 */
export function normalizePlate(input: string): string {
  return toLatinDigits(input).replace(/\s+/g, ' ').trim().toUpperCase();
}

/** For matching while typing: ignores spaces and dashes. */
export function plateSearchKey(input: string): string {
  return normalizePlate(input).replace(/[\s-]/g, '');
}
