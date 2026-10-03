const ARABIC_DIGIT_ZERO = 0x0660;

/**
 * Any common way of writing a Syrian mobile number -> "9639XXXXXXXX" (12 digits, no +).
 * Accepts 0912345678, 912345678, +963912345678, 00963912345678, spaces, Arabic digits.
 * Returns null for anything that is not a Syrian mobile number.
 */
export function normalizeSyrianPhone(input: string): string | null {
  let digits = input
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - ARABIC_DIGIT_ZERO))
    .replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 10) digits = '963' + digits.slice(1);
  else if (digits.startsWith('9') && digits.length === 9) digits = '963' + digits;
  return /^9639\d{8}$/.test(digits) ? digits : null;
}
