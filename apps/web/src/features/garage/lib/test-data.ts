import type { CustomerRecord, VehicleRecord } from '@carwash/shared';

const base = { createdAt: 1, updatedAt: 1, deviceId: 'd', deletedAt: null };

export const customer = {
  ...base,
  id: 'c1',
  code: 'A-0001',
  name: 'سامر',
  job: '',
  phone: '963933111222',
  notes: '',
} as CustomerRecord;

export const vehicle = {
  ...base,
  id: 'v1',
  customerId: 'c1',
  plate: 'حلب 1',
  color: '',
  size: 'sedan',
} as VehicleRecord;

export const owner = { id: 'u1', name: 'المالك', username: 'owner', role: 'admin' as const };
