import { describe, expect, it } from 'vitest';
import { formatCountdown, formatDuration, formatMonth, startOfDay } from './time-format';

describe('time formatting', () => {
  it('counts down in minutes and seconds', () => {
    expect(formatCountdown(9 * 60_000 + 41_000)).toBe('9:41');
    expect(formatCountdown(-5)).toBe('0:00');
  });

  it('shows short durations', () => {
    expect(formatDuration(80 * 60_000)).toBe('1 س 20 د');
    expect(formatDuration(5 * 60_000)).toBe('5 د');
    expect(formatDuration((50 * 60 + 5) * 60_000)).toBe('2 ي 2 س');
  });

  it('finds local midnight', () => {
    const noon = new Date(2026, 9, 4, 12, 30).getTime();
    expect(startOfDay(noon)).toBe(new Date(2026, 9, 4).getTime());
  });
});

describe('formatMonth', () => {
  it('uses the Syrian month names', () => {
    expect(formatMonth('2026-10')).toBe('تشرين الأول 2026');
    expect(formatMonth('2027-01')).toBe('كانون الثاني 2027');
  });
});
