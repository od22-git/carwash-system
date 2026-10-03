import { describe, expect, it } from 'vitest';
import { formatSYP, receiptNumber } from '.';

describe('formatSYP', () => {
  it('groups thousands and adds the currency', () => {
    expect(formatSYP(1_234_567)).toBe('1,234,567 ل.س');
  });
});

describe('receiptNumber', () => {
  it('pads the sequence after the laptop prefix', () => {
    expect(receiptNumber('U', 123)).toBe('U-000123');
    expect(receiptNumber('A', 1)).toBe('A-000001');
  });

  it('rejects bad prefixes and sequences', () => {
    expect(() => receiptNumber('u', 1)).toThrow();
    expect(() => receiptNumber('U', 0)).toThrow();
  });
});
