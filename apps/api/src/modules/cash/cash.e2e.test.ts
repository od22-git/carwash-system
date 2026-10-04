import type { INestApplication } from '@nestjs/common';
import { ApiClient } from '../../test-utils/api-client';
import { createTestApp } from '../../test-utils/create-test-app';
import { resetDatabase } from '../../test-utils/reset-database';

const DAY = '2026-10-04';
const close = (deviceId: string, changes: Record<string, unknown> = {}) => ({
  table: 'cashCloses',
  row: {
    id: DAY,
    createdAt: 1,
    updatedAt: 1,
    deviceId,
    deletedAt: null,
    day: DAY,
    expected: 645000,
    float: 50000,
    paidOut: 0,
    counted: 690000,
    closedBy: 'موظف الاستقبال',
    at: 1,
    note: '',
    ...changes,
  },
});

describe('cash close: one per day, the admin corrects or reopens', () => {
  let app: INestApplication;
  let api: ApiClient;

  beforeAll(async () => {
    await resetDatabase();
    app = await createTestApp();
    api = new ApiClient(app);
  });

  afterAll(() => app.close());

  it('the cashier closes once; after the admin reopens, the cashier closes again', async () => {
    const owner = await api.setupAdmin();
    const user = await api.createUser(owner.token, 'cashier', 'user');
    const adminDevice = (await api.registerDevice(owner.token)).id;
    const cashierDevice = (await api.registerDevice(user.token)).id;
    const admin = api.as(owner.token, adminDevice);
    const cashier = api.as(user.token, cashierDevice);

    expect((await cashier.push([close(cashierDevice)])).body.rejected).toEqual([]);
    const recount = await cashier.push([close(cashierDevice, { counted: 700000, updatedAt: 2 })]);
    expect(recount.body.rejected[0].reason).toBe('locked');

    const reopen = await admin.push([close(adminDevice, { deletedAt: 3, updatedAt: 3 })]);
    expect(reopen.body.rejected).toEqual([]);
    const again = await cashier.push([close(cashierDevice, { counted: 695000, updatedAt: 4 })]);
    expect(again.body.rejected).toEqual([]);

    const pulled = await admin.pull(0);
    const group = pulled.body.changes.find((c: { table: string }) => c.table === 'cashCloses');
    expect(group.rows).toHaveLength(1);
    expect(group.rows[0]).toMatchObject({ counted: 695000, deletedAt: null });
  });
});
