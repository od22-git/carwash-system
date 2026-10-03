import { describe, expect, it } from 'vitest';
import { dayRange, fromDateInput, monthRange, toDateInput, toMonthInput } from './date-input';

const now = new Date(2026, 9, 4, 18, 30).getTime();

describe('date inputs', () => {
  it('formats the local day and month', () => {
    expect(toDateInput(now)).toBe('2026-10-04');
    expect(toMonthInput(now)).toBe('2026-10');
  });

  it('today means now; another day means its midday', () => {
    expect(fromDateInput('2026-10-04', now)).toBe(now);
    expect(fromDateInput('2026-10-01', now)).toBe(new Date(2026, 9, 1, 12).getTime());
    expect(fromDateInput('', now)).toBe(now);
  });

  it('day and month ranges', () => {
    const [start, end] = dayRange(now);
    expect([start, end]).toEqual([new Date(2026, 9, 4).getTime(), new Date(2026, 9, 5).getTime()]);
    expect(monthRange('2026-12')).toEqual([
      new Date(2026, 11, 1).getTime(),
      new Date(2027, 0, 1).getTime(),
    ]);
  });
});
