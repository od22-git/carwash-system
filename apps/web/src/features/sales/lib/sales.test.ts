import type { ProductRecord } from '@carwash/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../core/db';
import { freshLaptop } from '../../../core/sync/test-helpers';
import { cartLines, cartReducer, itemKey, type CartItem } from './cart';
import { findByBarcode, searchProducts } from './find-product';
import { cancelSale, completeSale } from './sale-actions';

const base = { createdAt: 1, updatedAt: 1, deviceId: 'd', deletedAt: null, active: true };
const oil = {
  ...base,
  id: 'oil',
  kind: 'stock',
  name: 'زيت محرك',
  unit: 'قطعة',
  unitsPerCarton: 12,
  barcode: '6281000123',
  retailPrice: 60_000,
  wholesalePrice: 650_000,
  minQty: 0,
} as ProductRecord;
const water = {
  ...oil,
  id: 'water',
  kind: 'buffet',
  name: 'مياه',
  barcode: '',
  unitsPerCarton: 1,
  wholesalePrice: 0,
  retailPrice: 3_000,
} as ProductRecord;
const products = [oil, water];
const owner = { id: 'u1', name: 'المالك', username: 'owner', role: 'admin' as const };

const run = (...actions: Parameters<typeof cartReducer>[1][]) =>
  actions.reduce<CartItem[]>(cartReducer, []);

describe('cart', () => {
  it('scanning the same product twice adds to its line', () => {
    expect(run({ type: 'add', product: oil }, { type: 'add', product: oil })).toEqual([
      { productId: 'oil', mode: 'piece', quantity: 2 },
    ]);
  });

  it('switching a line to cartons merges with an existing carton line', () => {
    const cart = run(
      { type: 'add', product: oil, mode: 'carton' },
      { type: 'add', product: oil },
      { type: 'mode', key: 'oil:piece', mode: 'carton' },
    );
    expect(cart).toEqual([{ productId: 'oil', mode: 'carton', quantity: 2 }]);
  });

  it('quantity never drops below 1; remove and clear', () => {
    let cart = run(
      { type: 'add', product: water },
      { type: 'quantity', key: 'water:piece', quantity: 0 },
    );
    expect(cart[0]!.quantity).toBe(1);
    cart = cartReducer(cart, { type: 'remove', key: itemKey(cart[0]!) });
    expect(cart).toEqual([]);
    expect(cartReducer(run({ type: 'add', product: oil }), { type: 'clear' })).toEqual([]);
  });

  it('prices the lines with the products’ prices', () => {
    const cart = run(
      { type: 'add', product: oil, mode: 'carton' },
      { type: 'add', product: water },
    );
    expect(cartLines(cart, products).map((l) => l.total)).toEqual([650_000, 3_000]);
  });
});

describe('finding products', () => {
  it('by scanned barcode (Arabic digits too) or by part of the name', () => {
    expect(findByBarcode(products, '6281000123')?.id).toBe('oil');
    expect(findByBarcode(products, '٦٢٨١٠٠٠١٢٣')?.id).toBe('oil');
    expect(findByBarcode(products, '')).toBeUndefined();
    expect(searchProducts(products, 'مياة').map((p) => p.id)).toEqual(['water']);
    expect(searchProducts(products, '628').map((p) => p.id)).toEqual(['oil']);
  });
});

describe('sales', () => {
  beforeEach(freshLaptop);

  it('saves a paid sale with a receipt number and the total', async () => {
    const sale = await completeSale(cartLines(run({ type: 'add', product: water }), products));
    expect(sale).toMatchObject({ receiptNo: 'A-000001', total: 3_000, status: 'paid' });
  });

  it('refuses an empty cart', async () => {
    await expect(completeSale([])).rejects.toThrow('السلة فارغة');
  });

  it('cancelling keeps the receipt and logs it', async () => {
    const sale = await completeSale(cartLines(run({ type: 'add', product: oil }), products));
    const cancelled = await cancelSale(sale, 'خطأ في الصنف', owner);
    expect(cancelled).toMatchObject({ status: 'cancelled', cancelReason: 'خطأ في الصنف' });
    const [event] = await db.auditEvents.toArray();
    expect(event).toMatchObject({ action: 'sale.cancel', summary: 'A-000001 (60,000 ل.س)' });
  });
});
