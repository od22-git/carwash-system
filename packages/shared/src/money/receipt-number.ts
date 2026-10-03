/**
 * Receipt numbers are made on each laptop, even offline, so each laptop has its own prefix
 * and the two laptops can never produce the same number.
 * receiptNumber('U', 123) -> "U-000123"
 */
export function receiptNumber(devicePrefix: string, sequence: number): string {
  if (!/^[A-Z]{1,3}$/.test(devicePrefix)) {
    throw new Error(`Device prefix must be 1-3 capital letters, got "${devicePrefix}"`);
  }
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error(`Receipt sequence must be a positive integer, got ${sequence}`);
  }
  return `${devicePrefix}-${String(sequence).padStart(6, '0')}`;
}
