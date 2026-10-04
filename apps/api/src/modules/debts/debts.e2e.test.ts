import type { INestApplication } from '@nestjs/common';
import { ApiClient } from '../../test-utils/api-client';
import { createTestApp } from '../../test-utils/create-test-app';
import { resetDatabase } from '../../test-utils/reset-database';

const payment = (deviceId: string, changes: Record<string, unknown> = {}) => ({
  table: 'debtPayments',
  row: {
    id: 'dp1',
    createdAt: 1,
    updatedAt: 1,
    deviceId,
    deletedAt: null,
    receiptNo: 'B-000001',
    customerId: 'c1',
    customerName: 'سامر',
    amount: 50000,
    at: 1,
    note: '',
    ...changes,
  },
});

describe('debt payments: the cashier records, only the admin corrects', () => {
  let app: INestApplication;
  let api: ApiClient;

  beforeAll(async () => {
    await resetDatabase();
    app = await createTestApp();
    api = new ApiClient(app);
  });

  afterAll(() => app.close());

  it('a cashier payment reaches the admin; the cashier cannot change or delete it', async () => {
    const owner = await api.setupAdmin();
    const user = await api.createUser(owner.token, 'cashier', 'user');
    const adminDevice = (await api.registerDevice(owner.token)).id;
    const cashierDevice = (await api.registerDevice(user.token)).id;
    const admin = api.as(owner.token, adminDevice);
    const cashier = api.as(user.token, cashierDevice);

    expect((await cashier.push([payment(cashierDevice)])).body.rejected).toEqual([]);
    const pulled = await admin.pull(0);
    const group = pulled.body.changes.find((c: { table: string }) => c.table === 'debtPayments');
    expect(group.rows).toHaveLength(1);

    const edit = await cashier.push([payment(cashierDevice, { amount: 5000, updatedAt: 2 })]);
    expect(edit.body.rejected[0].reason).toBe('locked');
    const remove = await cashier.push([payment(cashierDevice, { deletedAt: 3, updatedAt: 3 })]);
    expect(remove.body.rejected[0].reason).toBe('admin_only');

    const fixed = await admin.push([payment(adminDevice, { deletedAt: 4, updatedAt: 4 })]);
    expect(fixed.body.rejected).toEqual([]);
  });
});
