import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../core/db';
import { freshLaptop } from '../../../core/sync/test-helpers';
import { addDefaultServices, addService, parsePrice, setPrice } from './catalog-actions';

describe('parsePrice', () => {
  it('reads prices typed with commas or Arabic digits', () => {
    expect(parsePrice('25,000')).toBe(25000);
    expect(parsePrice('٢٥٠٠٠')).toBe(25000);
    expect(parsePrice('  ')).toBeNull();
  });
});

describe('catalog actions', () => {
  beforeEach(freshLaptop);

  it('adds the nine proposal services in order', async () => {
    await addDefaultServices();
    const services = await db.services.orderBy('id').toArray();
    expect(services).toHaveLength(9);
    expect(Math.max(...services.map((s) => s.sortOrder))).toBe(9);
  });

  it('puts a new service at the end', async () => {
    const first = await addService('غسيل سفلي', []);
    const second = await addService('تلميع', [first as never]);
    expect(second.sortOrder).toBe(2);
  });

  it('sets, clears and sets again a price on the same row', async () => {
    await setPrice('s1', 'suv', 20000);
    await setPrice('s1', 'suv', null);
    expect((await db.servicePrices.get('s1:suv'))?.deletedAt).toBeTypeOf('number');
    await setPrice('s1', 'suv', 22000);
    expect(await db.servicePrices.get('s1:suv')).toMatchObject({ price: 22000, deletedAt: null });
    expect(await db.servicePrices.count()).toBe(1);
  });
});
