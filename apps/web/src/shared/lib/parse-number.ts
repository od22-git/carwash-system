import { toLatinDigits } from '@carwash/shared';

/** "150,000", "١٥٠٠٠٠" or " 24 " -> the whole number. Empty or no digits -> NaN. */
export function parseWholeNumber(text: string): number {
  const digits = toLatinDigits(text).replace(/[^\d]/g, '');
  return digits ? Number(digits) : NaN;
}
