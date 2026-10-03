import { describe, expect, it } from 'vitest';
import { customerCode, receiptNumber, toLatinDigits } from '.';

describe('numbering', () => {
  it('pads the sequence after the laptop prefix', () => {
    expect(receiptNumber('U', 123)).toBe('U-000123');
    expect(customerCode('A', 12)).toBe('A-0012');
  });

  it('rejects bad prefixes and sequences', () => {
    expect(() => receiptNumber('u', 1)).toThrow();
    expect(() => customerCode('A', 0)).toThrow();
  });
});

describe('toLatinDigits', () => {
  it('converts Arabic and Persian digits', () => {
    expect(toLatinDigits('٠٩٣٣ و ۱۲۳')).toBe('0933 و 123');
  });
});
