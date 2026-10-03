import { describe, expect, it } from 'vitest';
import { costPerCar, countResult, splitUnits, stockStatus, toUnits } from '.';

describe('countResult', () => {
  it('what is missing since the last count is consumed', () => {
    expect(countResult(30, 22, 5_000)).toEqual({
      diff: -8,
      consumed: 8,
      value: -40_000,
      aboveExpected: false,
    });
  });

  it('a count higher than expected is flagged, nothing consumed', () => {
    expect(countResult(5, 7, 5_000)).toMatchObject({ diff: 2, consumed: 0, aboveExpected: true });
  });
});

describe('stockStatus', () => {
  it('out, low or ok', () => {
    expect(stockStatus(0, 5)).toBe('out');
    expect(stockStatus(5, 5)).toBe('low');
    expect(stockStatus(6, 5)).toBe('ok');
    expect(stockStatus(1, 0)).toBe('ok');
  });
});

describe('costPerCar', () => {
  it('rounds, and has no value without cars', () => {
    expect(costPerCar(100_000, 3)).toBe(33_333);
    expect(costPerCar(100_000, 0)).toBeNull();
  });
});

describe('units', () => {
  it('converts cartons to units and back', () => {
    expect(toUnits(3, 5, 12)).toBe(41);
    expect(splitUnits(41, 12)).toEqual({ cartons: 3, pieces: 5 });
    expect(splitUnits(7, 1)).toEqual({ cartons: 0, pieces: 7 });
  });
});
