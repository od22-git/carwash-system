import { describe, expect, it } from 'vitest';
import { periodLabel, periodRange, periodTitle } from './period';

const local = (m: number, d: number) => new Date(2026, m, d).getTime();
const now = new Date(2026, 9, 8, 18).getTime(); // Thursday 8 Oct 2026

describe('periodRange', () => {
  it('day, week (from Saturday) and month of the chosen day', () => {
    expect(periodRange({ kind: 'day', day: '2026-10-08' }, now)).toEqual([
      local(9, 8),
      local(9, 9),
    ]);
    expect(periodRange({ kind: 'week', day: '2026-10-08' }, now)).toEqual([
      local(9, 3),
      local(9, 10),
    ]);
    expect(periodRange({ kind: 'month', day: '2026-10-08' }, now)).toEqual([
      local(9, 1),
      local(10, 1),
    ]);
  });
});

describe('periodLabel', () => {
  it('names the period for files and titles', () => {
    expect(periodLabel({ kind: 'day', day: '2026-10-08' }, now)).toBe('2026-10-08');
    expect(periodLabel({ kind: 'week', day: '2026-10-08' }, now)).toBe('أسبوع 2026-10-03');
    expect(periodLabel({ kind: 'month', day: '2026-10-08' }, now)).toBe('2026-10');
    expect(periodTitle({ kind: 'day', day: '2026-10-08' }, now)).toBe('08/10/2026');
    expect(periodTitle({ kind: 'week', day: '2026-10-08' }, now)).toBe('أسبوع 03/10/2026');
    expect(periodTitle({ kind: 'month', day: '2026-10-08' }, now)).toBe('تشرين الأول 2026');
  });
});
