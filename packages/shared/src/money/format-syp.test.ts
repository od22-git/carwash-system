import { describe, expect, it } from 'vitest';
import { formatSYP } from '.';

describe('formatSYP', () => {
  it('groups thousands and adds the currency', () => {
    expect(formatSYP(1_234_567)).toBe('1,234,567 ل.س');
  });

  it('shows a negative zero as plain 0', () => {
    expect(formatSYP(-0)).toBe('0 ل.س');
    expect(formatSYP(-0.4)).toBe('0 ل.س');
  });
});
