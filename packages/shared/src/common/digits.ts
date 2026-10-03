const ARABIC_ZERO = 0x0660;
const PERSIAN_ZERO = 0x06f0;

/** "٠٩٣٣" or "۰۹۳۳" -> "0933". Cashiers type with either keyboard layout. */
export function toLatinDigits(text: string): string {
  return text
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - ARABIC_ZERO))
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - PERSIAN_ZERO));
}
