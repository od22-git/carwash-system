import { buildLedger, levelAt, type ProductRecord } from '@carwash/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../core/db';
import { freshLaptop } from '../../../core/sync/test-helpers';
import { deleteMovement, recordCount, recordDamage, recordPurchase } from './movement-actions';
import { barcodeTaken, saveProduct, type ProductInput } from './product-actions';
import { describeLevel, lowRows, stockRow } from './stock-rows';

const owner = { id: 'u1', name: 'المالك', username: 'owner', role: 'admin' as const };

const oilInput: ProductInput = {
  kind: 'stock',
  name: 'زيت محرك',
  unit: '',
  unitsPerCarton: '12',
  barcode: ' 6281000123 ',
  retailPrice: '٦٠,٠٠٠',
  wholesalePrice: '650,000',
  minQty: '6',
  active: true,
};

async function ledgerOf(product: ProductRecord) {
  const movements = await db.stockMovements.toArray();
  return buildLedger(movements, []).get(product.id) ?? [];
}

describe('products', () => {
  beforeEach(freshLaptop);

  it('reads typed numbers, trims the barcode and defaults the unit', async () => {
    const oil = await saveProduct(oilInput);
    expect(oil).toMatchObject({
      unit: 'قطعة',
      barcode: '6281000123',
      retailPrice: 60_000,
      wholesalePrice: 650_000,
      minQty: 6,
    });
    expect(barcodeTaken([oil], '6281000123')).toBe(true);
    expect(barcodeTaken([oil], '6281000123', oil.id)).toBe(false);
  });

  it('explains what is wrong instead of saving', async () => {
    const oil = await saveProduct(oilInput);
    await expect(saveProduct({ ...oilInput, name: 'ز' })).rejects.toThrow('اكتب اسم الصنف.');
    await expect(saveProduct({ ...oilInput, name: 'زيت آخر' }, undefined, [oil])).rejects.toThrow(
      'هذا الباركود مسجّل لصنف آخر.',
    );
    await expect(
      saveProduct({ ...oilInput, barcode: '', retailPrice: '', wholesalePrice: '' }),
    ).rejects.toThrow('اكتب سعر القطعة أو سعر الكرتونة.');
  });

  it('a wash material never gets prices or a barcode', async () => {
    const shampoo = await saveProduct({
      ...oilInput,
      kind: 'consumable',
      name: 'شامبو',
      unit: 'لتر',
    });
    expect(shampoo).toMatchObject({ retailPrice: 0, wholesalePrice: 0, barcode: '', unit: 'لتر' });
  });
});

describe('stock movements', () => {
  let oil: ProductRecord;

  beforeEach(async () => {
    await freshLaptop();
    oil = await saveProduct(oilInput);
  });

  it('a purchase by the carton adds all its units, at the price paid', async () => {
    const bought = await recordPurchase({
      product: oil,
      mode: 'carton',
      quantity: 3,
      price: 500_000,
      at: 1,
      supplier: ' مورد الأمل ',
      note: '',
    });
    expect(bought).toMatchObject({ qty: 36, value: 1_500_000, supplier: 'مورد الأمل' });
  });

  it('damage and counts move the shelf to what is really there', async () => {
    const at = 1;
    await recordPurchase({
      product: oil,
      mode: 'piece',
      quantity: 10,
      price: 50_000,
      at,
      supplier: '',
      note: '',
    });
    await recordDamage(oil, 1, 50_000, 'انكسرت');
    const count = await recordCount(oil, 9, 7, 50_000);
    expect(count).toMatchObject({ qty: -2, value: -100_000, counted: 7 });
    expect(levelAt(await ledgerOf(oil))).toBe(7);
  });

  it('deleting a wrong entry hides it and logs who did it', async () => {
    const wrong = await recordPurchase({
      product: oil,
      mode: 'piece',
      quantity: 99,
      price: 1,
      at: 1,
      supplier: '',
      note: '',
    });
    await deleteMovement(wrong, oil, owner);
    expect(levelAt(await ledgerOf(oil))).toBe(0);
    const [event] = await db.auditEvents.toArray();
    expect(event).toMatchObject({ action: 'stock.delete', targetId: wrong.id, userName: 'المالك' });
  });
});

describe('stock rows', () => {
  beforeEach(freshLaptop);

  it('shows cartons and pieces, and flags low stock', async () => {
    const oil = await saveProduct(oilInput);
    await recordPurchase({
      product: oil,
      mode: 'piece',
      quantity: 29,
      price: 50_000,
      at: 1,
      supplier: '',
      note: '',
    });
    const row = stockRow(oil, await ledgerOf(oil));
    expect(describeLevel(row)).toBe('2 كرتونة و 5 قطعة');
    expect(row).toMatchObject({ status: 'ok', value: 1_450_000 });
    expect(lowRows([row, stockRow(oil, [])])).toHaveLength(1);
  });
});
