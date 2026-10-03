import { describe, expect, it } from 'vitest';
import { defaultSaleMode, saleLine, saleTotal, sellPrice } from '.';

const oil = {
  id: 'oil',
  name: 'زيت محرك',
  kind: 'stock' as const,
  unitsPerCarton: 12,
  retailPrice: 60_000,
  wholesalePrice: 650_000,
};
const water = { ...oil, id: 'water', name: 'ماء', kind: 'buffet' as const, wholesalePrice: 0 };

describe('sellPrice', () => {
  it('piece and carton prices', () => {
    expect(sellPrice(oil, 'piece')).toBe(60_000);
    expect(sellPrice(oil, 'carton')).toBe(650_000);
    expect(sellPrice(water, 'carton')).toBeNull();
  });

  it('wash materials have no price', () => {
    expect(sellPrice({ ...oil, kind: 'consumable' }, 'piece')).toBeNull();
  });
});

describe('saleLine', () => {
  it('a carton takes all its units from stock', () => {
    expect(saleLine(oil, 'carton', 2)).toMatchObject({
      units: 24,
      unitPrice: 650_000,
      total: 1_300_000,
    });
  });

  it('pieces are priced one by one', () => {
    expect(saleLine(oil, 'piece', 3)).toMatchObject({ units: 3, total: 180_000, kind: 'stock' });
  });

  it('refuses a way of selling the product does not have, and bad quantities', () => {
    expect(() => saleLine(water, 'carton', 1)).toThrow();
    expect(() => saleLine(oil, 'piece', 0)).toThrow();
    expect(() => saleLine(oil, 'piece', 1.5)).toThrow();
  });

  it('adds up a receipt', () => {
    expect(saleTotal([saleLine(oil, 'piece', 1), saleLine(water, 'piece', 2)])).toBe(180_000);
  });
});

describe('defaultSaleMode', () => {
  it('by the piece when possible, else by the carton', () => {
    expect(defaultSaleMode(oil)).toBe('piece');
    expect(defaultSaleMode({ ...oil, retailPrice: 0 })).toBe('carton');
  });
});
