import { describe, expect, it } from 'vitest';
import { formatCountdown, formatDuration, startOfDay } from './time-format';

describe('time formatting', () => {
  it('counts down in minutes and seconds', () => {
    expect(formatCountdown(9 * 60_000 + 41_000)).toBe('9:41');
    expect(formatCountdown(-5)).toBe('0:00');
  });

  it('shows short durations', () => {
    expect(formatDuration(80 * 60_000)).toBe('1 س 20 د');
    expect(formatDuration(5 * 60_000)).toBe('5 د');
  });

  it('finds local midnight', () => {
    const noon = new Date(2026, 9, 4, 12, 30).getTime();
    expect(startOfDay(noon)).toBe(new Date(2026, 9, 4).getTime());
  });
});
