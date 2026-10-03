import { toLatinDigits } from '../common';

/** Stored form of a Syrian mobile number: 963 + 9 digits starting with 9. */
export const SYRIAN_MOBILE = /^9639\d{8}$/;

/**
 * Any common way of writing a Syrian mobile number -> "9639XXXXXXXX" (12 digits, no +).
 * Accepts 0912345678, 912345678, +963912345678, 00963912345678, spaces, Arabic digits.
 * Returns null for anything that is not a Syrian mobile number.
 */
export function normalizeSyrianPhone(input: string): string | null {
  let digits = toLatinDigits(input).replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 10) digits = '963' + digits.slice(1);
  else if (digits.startsWith('9') && digits.length === 9) digits = '963' + digits;
  return SYRIAN_MOBILE.test(digits) ? digits : null;
}

/** "963933111222" -> "0933 111 222", the way people say it. */
export function formatSyrianPhone(stored: string): string {
  if (!SYRIAN_MOBILE.test(stored)) return stored;
  const local = '0' + stored.slice(3);
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}
