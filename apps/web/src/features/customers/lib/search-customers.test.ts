import type { CustomerRecord, VehicleRecord } from '@carwash/shared';
import { describe, expect, it } from 'vitest';
import { searchCustomers } from './search-customers';

const meta = { createdAt: 1, deviceId: 'd', deletedAt: null };
const customer = (id: string, name: string, phone: string, code: string, updatedAt = 1) =>
  ({ ...meta, id, name, phone, code, job: '', notes: '', updatedAt }) as CustomerRecord;
const car = (id: string, customerId: string, plate: string) =>
  ({ ...meta, id, customerId, plate, color: '', size: 'sedan', updatedAt: 1 }) as VehicleRecord;

const customers = [
  customer('c1', 'أحمد الحلبي', '963933111222', 'A-0001', 5),
  customer('c2', 'سامر', '963944555666', 'B-0001', 9),
];
const vehicles = [
  car('v1', 'c1', 'حلب 123456'),
  car('v2', 'c1', 'دمشق 777'),
  car('v3', 'c2', 'حماة 55'),
];

const ids = (query: string) =>
  searchCustomers(query, customers, vehicles).map((m) => m.customer.id);

describe('searchCustomers', () => {
  it('lists everyone, newest first, when the box is empty', () => {
    expect(ids('')).toEqual(['c2', 'c1']);
  });

  it('finds by name, ignoring hamza and spelling forms', () => {
    expect(ids('احمد')).toEqual(['c1']);
  });

  it('finds by phone typed the local way', () => {
    expect(ids('0944 555')).toEqual(['c2']);
  });

  it('finds by plate, ignoring spaces and Arabic digits', () => {
    expect(ids('١٢٣٤٥')).toEqual(['c1']);
  });

  it('finds by customer number', () => {
    expect(ids('b-0001')).toEqual(['c2']);
  });

  it('returns each customer with all their cars', () => {
    expect(searchCustomers('سامر', customers, vehicles)[0]!.vehicles).toHaveLength(1);
    expect(searchCustomers('أحمد', customers, vehicles)[0]!.vehicles).toHaveLength(2);
  });
});
