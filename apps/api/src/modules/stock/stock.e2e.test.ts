import type { INestApplication } from '@nestjs/common';
import { ApiClient } from '../../test-utils/api-client';
import { createTestApp } from '../../test-utils/create-test-app';
import { resetDatabase } from '../../test-utils/reset-database';

type Laptop = ReturnType<ApiClient['as']>;

const base = (id: string, deviceId: string, updatedAt = 1) => ({
  id,
  createdAt: 1,
  updatedAt,
  deviceId,
  deletedAt: null,
});

const product = (deviceId: string) => ({
  table: 'products',
  row: {
    ...base('oil', deviceId),
    kind: 'stock',
    name: 'زيت محرك',
    unitsPerCarton: 12,
    retailPrice: 60000,
  },
});

const purchase = (deviceId: string) => ({
  table: 'stockMovements',
  row: {
    ...base('m1', deviceId),
    productId: 'oil',
    type: 'purchase',
    qty: 24,
    value: 1200000,
    at: 1,
  },
});

const sale = (deviceId: string, updatedAt: number, status: string) => ({
  table: 'sales',
  row: {
    ...base('s1', deviceId, updatedAt),
    receiptNo: 'B-000001',
    status,
    soldAt: 1,
    total: 60000,
    lines: [
      {
        productId: 'oil',
        name: 'زيت محرك',
        kind: 'stock',
        mode: 'piece',
        quantity: 1,
        units: 1,
        unitPrice: 60000,
        total: 60000,
      },
    ],
  },
});

const reasons = (res: { body: { rejected: { reason: string }[] } }) =>
  res.body.rejected.map((r) => r.reason);

const tablesIn = (res: { body: { changes: { table: string }[] } }) =>
  res.body.changes.map((c) => c.table).sort();

describe('stock and sales: who may do what', () => {
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

  it('only the admin adds products and stock movements', async () => {
    const byCashier = await cashier.push([product(cashierDevice), purchase(cashierDevice)]);
    expect(reasons(byCashier)).toEqual(['not_allowed', 'not_allowed']);
    const byAdmin = await admin.push([product(adminDevice), purchase(adminDevice)]);
    expect(byAdmin.body.rejected).toEqual([]);
  });

  it('the cashier sells, but cannot cancel or change a paid receipt', async () => {
    expect((await cashier.push([sale(cashierDevice, 2, 'paid')])).body.rejected).toEqual([]);
    const later = await cashier.push([sale(cashierDevice, 3, 'cancelled')]);
    expect(reasons(later)).toEqual(['admin_only']);
  });

  it('the admin cancels the sale', async () => {
    expect((await admin.push([sale(cashierDevice, 4, 'cancelled')])).body.rejected).toEqual([]);
  });

  it('the cashier receives products and sales, never purchases or costs', async () => {
    const pulled = await cashier.pull(0);
    expect(tablesIn(pulled)).toEqual(['products', 'sales']);
    const adminPull = await admin.pull(0);
    expect(tablesIn(adminPull)).toContain('stockMovements');
  });
});
