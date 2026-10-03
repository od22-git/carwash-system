import { describe, expect, it } from 'vitest';
import { productRecordSchema, saleRecordSchema, stockMovementRecordSchema } from '.';

const base = { id: 'x', createdAt: 1, updatedAt: 1, deviceId: 'd', deletedAt: null };

describe('productRecordSchema', () => {
  const oil = { ...base, kind: 'stock', name: 'زيت محرك', unitsPerCarton: 12, retailPrice: 60000 };

  it('accepts a car product sold by the piece', () => {
    expect(productRecordSchema.safeParse(oil).success).toBe(true);
  });

  it('needs units per carton for a carton price', () => {
    const bad = { ...oil, unitsPerCarton: 1, wholesalePrice: 600000 };
    expect(productRecordSchema.safeParse(bad).success).toBe(false);
  });

  it('a sellable product needs a price; a wash material may not have one', () => {
    expect(productRecordSchema.safeParse({ ...oil, retailPrice: 0 }).success).toBe(false);
    const shampoo = { ...base, kind: 'consumable', name: 'شامبو', unit: 'لتر' };
    expect(productRecordSchema.safeParse(shampoo).success).toBe(true);
    expect(productRecordSchema.safeParse({ ...shampoo, retailPrice: 5 }).success).toBe(false);
  });
});

describe('stockMovementRecordSchema', () => {
  const move = { ...base, productId: 'p', at: 1 };

  it('purchases add stock, damage removes it, counts carry the counted units', () => {
    const ok = (row: object) => stockMovementRecordSchema.safeParse(row).success;
    expect(ok({ ...move, type: 'purchase', qty: 12, value: 600000 })).toBe(true);
    expect(ok({ ...move, type: 'purchase', qty: -1, value: 0 })).toBe(false);
    expect(ok({ ...move, type: 'damage', qty: -1, value: -50000 })).toBe(true);
    expect(ok({ ...move, type: 'damage', qty: 1, value: 0 })).toBe(false);
    expect(ok({ ...move, type: 'count', qty: -3, value: -9000, counted: 7 })).toBe(true);
    expect(ok({ ...move, type: 'count', qty: -3, value: -9000 })).toBe(false);
  });
});

describe('saleRecordSchema', () => {
  const line = {
    productId: 'p',
    name: 'ماء',
    kind: 'buffet',
    mode: 'piece',
    quantity: 2,
    units: 2,
    unitPrice: 3000,
    total: 6000,
  };
  const sale = { ...base, receiptNo: 'A-000001', lines: [line], status: 'paid', soldAt: 1 };

  it('the total must match the lines', () => {
    expect(saleRecordSchema.safeParse({ ...sale, total: 6000 }).success).toBe(true);
    expect(saleRecordSchema.safeParse({ ...sale, total: 5000 }).success).toBe(false);
  });
});
