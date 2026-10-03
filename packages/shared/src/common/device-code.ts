/**
 * Numbers made on a laptop, even offline: the laptop's prefix keeps the two laptops
 * from ever producing the same number. deviceCode('A', 12, 4) -> "A-0012".
 */
export function deviceCode(devicePrefix: string, sequence: number, digits: number): string {
  if (!/^[A-Z]{1,3}$/.test(devicePrefix)) {
    throw new Error(`Device prefix must be 1-3 capital letters, got "${devicePrefix}"`);
  }
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error(`Sequence must be a positive integer, got ${sequence}`);
  }
  return `${devicePrefix}-${String(sequence).padStart(digits, '0')}`;
}
