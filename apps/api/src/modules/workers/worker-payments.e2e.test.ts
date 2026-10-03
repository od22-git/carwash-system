import type { INestApplication } from '@nestjs/common';
import { ApiClient } from '../../test-utils/api-client';
import { createTestApp } from '../../test-utils/create-test-app';
import { resetDatabase } from '../../test-utils/reset-database';

const advance = (deviceId: string) => ({
  table: 'workerPayments',
  row: {
    id: 'p1',
    createdAt: 1,
    updatedAt: 1,
    deviceId,
    deletedAt: null,
    workerId: 'w1',
    kind: 'advance',
    amount: 20000,
    at: 1,
  },
});

describe('worker payments: admin only', () => {
  let app: INestApplication;
  let api: ApiClient;

  beforeAll(async () => {
    await resetDatabase();
    app = await createTestApp();
    api = new ApiClient(app);
  });

  afterAll(() => app.close());

  it('the admin records an advance; the cashier can neither write nor read payments', async () => {
    const owner = await api.setupAdmin();
    const user = await api.createUser(owner.token, 'cashier', 'user');
    const adminDevice = (await api.registerDevice(owner.token)).id;
    const cashierDevice = (await api.registerDevice(user.token)).id;
    const admin = api.as(owner.token, adminDevice);
    const cashier = api.as(user.token, cashierDevice);

    expect((await admin.push([advance(adminDevice)])).body.rejected).toEqual([]);
    const refused = await cashier.push([advance(cashierDevice)]);
    expect(refused.body.rejected[0].reason).toBe('not_allowed');

    const pulled = await cashier.pull(0);
    const tables = pulled.body.changes.map((c: { table: string }) => c.table);
    expect(tables).not.toContain('workerPayments');
  });
});
