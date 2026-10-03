import type { INestApplication } from '@nestjs/common';
import { SETTING_DEFAULTS } from '@carwash/shared';
import { ApiClient } from '../../test-utils/api-client';
import { createTestApp } from '../../test-utils/create-test-app';
import { resetDatabase } from '../../test-utils/reset-database';

const base = (id: string, deviceId: string) => ({
  id,
  createdAt: 1,
  updatedAt: 1,
  deviceId,
  deletedAt: null,
});

type Laptop = ReturnType<ApiClient['as']>;
const rowsOf = (
  body: { changes: { table: string; rows: Record<string, unknown>[] }[] },
  t: string,
) => body.changes.find((c) => c.table === t)?.rows ?? [];

describe('milestone 2 tables: who may write and read what', () => {
  let app: INestApplication;
  let admin: Laptop;
  let cashier: Laptop;
  let adminDevice: string;
  let cashierDevice: string;

  beforeAll(async () => {
    await resetDatabase();
    app = await createTestApp();
    const api = new ApiClient(app);
    const owner = await api.setupAdmin();
    const user = await api.createUser(owner.token, 'cashier', 'user');
    adminDevice = (await api.registerDevice(owner.token)).id;
    cashierDevice = (await api.registerDevice(user.token)).id;
    admin = api.as(owner.token, adminDevice);
    cashier = api.as(user.token, cashierDevice);
  });

  afterAll(() => app.close());

  it('admin sets services, prices and workers', async () => {
    const res = await admin.push([
      {
        table: 'services',
        row: { ...base('s1', adminDevice), name: 'غسيل سفلي', sortOrder: 1, active: true },
      },
      {
        table: 'servicePrices',
        row: { ...base('s1:suv', adminDevice), serviceId: 's1', size: 'suv', price: 20000 },
      },
      {
        table: 'workers',
        row: {
          ...base('w1', adminDevice),
          name: 'محمد',
          payType: 'commission',
          rate: 30,
          active: true,
        },
      },
      {
        table: 'settings',
        row: { ...base('garage', adminDevice), value: SETTING_DEFAULTS.garage },
      },
    ]);
    expect(res.body.rejected).toEqual([]);
  });

  it('the cashier gets prices and worker names, but not worker pay', async () => {
    const pull = await cashier.pull(0).expect(200);
    expect(rowsOf(pull.body, 'servicePrices')[0]).toMatchObject({ price: 20000 });
    const worker = rowsOf(pull.body, 'workers')[0]!;
    expect(worker.name).toBe('محمد');
    expect(worker).not.toHaveProperty('rate');
    expect(worker).not.toHaveProperty('payType');
  });

  it('the admin still sees worker pay', async () => {
    const pull = await admin.pull(0);
    expect(rowsOf(pull.body, 'workers')[0]).toMatchObject({ payType: 'commission', rate: 30 });
  });

  it('the cashier registers a customer with a car', async () => {
    const res = await cashier.push([
      {
        table: 'customers',
        row: { ...base('c1', cashierDevice), code: 'B-0001', name: 'سامر', phone: '963933111222' },
      },
      {
        table: 'vehicles',
        row: { ...base('v1', cashierDevice), customerId: 'c1', plate: 'حلب 123456', size: 'suv' },
      },
    ]);
    expect(res.body).toEqual({ accepted: ['c1', 'v1'], rejected: [] });
  });

  it('the cashier cannot change prices or workers', async () => {
    const res = await cashier.push([
      {
        table: 'servicePrices',
        row: { ...base('s1:suv', cashierDevice), serviceId: 's1', size: 'suv', price: 1 },
      },
      {
        table: 'workers',
        row: {
          ...base('w1', cashierDevice),
          name: 'x',
          payType: 'commission',
          rate: 99,
          active: true,
        },
      },
    ]);
    expect(res.body.rejected.map((r: { reason: string }) => r.reason)).toEqual([
      'not_allowed',
      'not_allowed',
    ]);
  });

  it('rejects a customer phone that is not a normalized Syrian mobile', async () => {
    const res = await cashier.push([
      {
        table: 'customers',
        row: { ...base('c2', cashierDevice), code: 'B-0002', name: 'ليلى', phone: '0933111222' },
      },
    ]);
    expect(res.body.rejected[0].reason).toBe('invalid');
  });
});
