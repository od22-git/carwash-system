import { describe, expect, it } from 'vitest';
import { periodRange } from './period';

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
