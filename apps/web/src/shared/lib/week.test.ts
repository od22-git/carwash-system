import { describe, expect, it } from 'vitest';
import { startOfWeek, weekRange } from './week';

describe('weeks start on Saturday', () => {
  it('a Thursday belongs to the week that began the Saturday before', () => {
    const thursday = new Date(2026, 9, 8, 15).getTime(); // Thu 8 Oct 2026
    expect(startOfWeek(thursday)).toBe(new Date(2026, 9, 3).getTime()); // Sat 3 Oct
  });

  it('a Saturday starts its own week', () => {
    const saturday = new Date(2026, 9, 3, 9).getTime();
    expect(weekRange(saturday)).toEqual([
      new Date(2026, 9, 3).getTime(),
      new Date(2026, 9, 10).getTime(),
    ]);
  });
});
