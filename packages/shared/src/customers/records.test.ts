import { describe, expect, it } from 'vitest';
import { buildPriceMatrix, servicePriceId } from '../catalog';
import { workerRecordSchema } from '../workers';
import { customerRecordSchema, formatSyrianPhone, normalizePlate, plateSearchKey } from '.';

const base = { id: 'x', createdAt: 1, updatedAt: 1, deviceId: 'd', deletedAt: null };

describe('plates', () => {
  it('normalizes digits and spaces', () => {
    expect(normalizePlate('  حلب   ١٢٣٤٥٦ ')).toBe('حلب 123456');
    expect(plateSearchKey('حلب 123-456')).toBe('حلب123456');
  });
});

describe('formatSyrianPhone', () => {
  it('shows the stored number the way people say it', () => {
    expect(formatSyrianPhone('963933111222')).toBe('0933 111 222');
  });
});

describe('customerRecordSchema', () => {
  it('requires a normalized phone and fills optional fields', () => {
    const ok = customerRecordSchema.parse({
      ...base,
      code: 'A-0001',
      name: 'سامر',
      phone: '963933111222',
    });
    expect(ok.job).toBe('');
    expect(customerRecordSchema.safeParse({ ...ok, phone: '0933111222' }).success).toBe(false);
  });
});

describe('price matrix', () => {
  it('builds service -> size -> price', () => {
    const m = buildPriceMatrix([
      { serviceId: 's1', size: 'sedan', price: 25_000 },
      { serviceId: 's1', size: 'suv', price: 35_000 },
    ]);
    expect(m).toEqual({ s1: { sedan: 25_000, suv: 35_000 } });
    expect(servicePriceId('s1', 'suv')).toBe('s1:suv');
  });
});

describe('workerRecordSchema', () => {
  const worker = { ...base, name: 'محمد', payType: 'commission', rate: 30, active: true };
  it('accepts a commission up to 100%', () => {
    expect(workerRecordSchema.safeParse(worker).success).toBe(true);
    expect(workerRecordSchema.safeParse({ ...worker, rate: 130 }).success).toBe(false);
  });
  it('allows any amount for fixed pay', () => {
    const fixed = { ...worker, payType: 'fixed_daily', rate: 75_000 };
    expect(workerRecordSchema.safeParse(fixed).success).toBe(true);
  });
});
