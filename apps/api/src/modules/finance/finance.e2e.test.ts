import type { INestApplication } from '@nestjs/common';
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

const expense = (deviceId: string) => ({
  table: 'expenses',
  row: { ...base('e1', deviceId), category: 'internet', amount: 150000, at: 1 },
});

const budget = (deviceId: string) => ({
  table: 'budgets',
  row: { ...base('2026-10:rent', deviceId), month: '2026-10', line: 'rent', amount: 1000000 },
});

describe('finance: admin only', () => {
  let app: INestApplication;
  let api: ApiClient;

  beforeAll(async () => {
    await resetDatabase();
    app = await createTestApp();
    api = new ApiClient(app);
  });

  afterAll(() => app.close());

  it('the admin records expenses and budgets; the cashier can neither write nor read them', async () => {
    const owner = await api.setupAdmin();
    const user = await api.createUser(owner.token, 'cashier', 'user');
    const adminDevice = (await api.registerDevice(owner.token)).id;
    const cashierDevice = (await api.registerDevice(user.token)).id;
    const admin = api.as(owner.token, adminDevice);
    const cashier = api.as(user.token, cashierDevice);

    const saved = await admin.push([expense(adminDevice), budget(adminDevice)]);
    expect(saved.body.rejected).toEqual([]);
    const refused = await cashier.push([expense(cashierDevice), budget(cashierDevice)]);
    expect(refused.body.rejected.map((r: { reason: string }) => r.reason)).toEqual([
      'not_allowed',
      'not_allowed',
    ]);

    const tables = (await cashier.pull(0)).body.changes.map((c: { table: string }) => c.table);
    expect(tables).not.toContain('expenses');
    expect(tables).not.toContain('budgets');
  });
});
