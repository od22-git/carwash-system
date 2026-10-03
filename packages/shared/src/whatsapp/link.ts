import { normalizeSyrianPhone } from '../customers';

/**
 * Link that opens WhatsApp with the message ready; the employee still presses send.
 * Returns null when the number is not a valid Syrian mobile number.
 */
export function whatsappLink(phone: string, message: string): string | null {
  const digits = normalizeSyrianPhone(phone);
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
}
