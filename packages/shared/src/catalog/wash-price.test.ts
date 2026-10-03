import { describe, expect, it } from 'vitest';
import { washPrice, type PriceMatrix } from '.';

const matrix: PriceMatrix = {
  exterior: { small: 20_000, sedan: 25_000, suv: 35_000 },
  underbody: { small: 15_000, sedan: 15_000, suv: 20_000 },
  engine: { sedan: 30_000 },
};

describe('washPrice', () => {
  it('adds up the selected services for the car size', () => {
    const r = washPrice(['underbody', 'exterior'], 'suv', matrix);
    expect(r.total).toBe(55_000);
    expect(r.missing).toEqual([]);
  });

  it('counts a service selected twice only once', () => {
    expect(washPrice(['exterior', 'exterior'], 'sedan', matrix).total).toBe(25_000);
  });

  it('reports services that have no price for this size', () => {
    const r = washPrice(['exterior', 'engine'], 'small', matrix);
    expect(r.total).toBe(20_000);
    expect(r.missing).toEqual(['engine']);
  });
});
