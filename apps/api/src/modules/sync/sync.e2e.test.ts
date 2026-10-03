import type { INestApplication } from '@nestjs/common';
import { SETTING_DEFAULTS } from '@carwash/shared';
import { ApiClient } from '../../test-utils/api-client';
import { createTestApp } from '../../test-utils/create-test-app';
import { resetDatabase } from '../../test-utils/reset-database';

const garageSetting = (deviceId: string, updatedAt: number, hourlyRate: number) => ({
  table: 'settings',
  row: {
    id: 'garage',
    createdAt: 1,
    updatedAt,
    deviceId,
    deletedAt: null,
    value: { ...SETTING_DEFAULTS.garage, hourlyRate },
  },
});

describe('sync', () => {
  let app: INestApplication;
  let api: ApiClient;
  let adminLaptop: ReturnType<ApiClient['as']>;
  let cashierLaptop: ReturnType<ApiClient['as']>;
  let adminDeviceId: string;

  beforeAll(async () => {
    await resetDatabase();
    app = await createTestApp();
    api = new ApiClient(app);
    const admin = await api.setupAdmin();
    const cashier = await api.createUser(admin.token, 'cashier', 'user');
    const a = await api.registerDevice(admin.token, 'لابتوب المسؤول');
    const c = await api.registerDevice(cashier.token);
    expect([a.prefix, c.prefix]).toEqual(['A', 'B']);
    adminDeviceId = a.id;
    adminLaptop = api.as(admin.token, a.id);
    cashierLaptop = api.as(cashier.token, c.id);
  });

  afterAll(() => app.close());

  it('refuses requests from an unregistered laptop', async () => {
    const admin = await api.http
      .post('/api/auth/login')
      .send({ username: 'owner', password: 'secret123' });
    await api.as(admin.body.token, '00000000-0000-0000-0000-000000000000').pull().expect(400);
  });

  it('admin change reaches the cashier laptop', async () => {
    const push = await adminLaptop.push([garageSetting(adminDeviceId, 1000, 12_000)]).expect(200);
    expect(push.body).toEqual({ accepted: ['garage'], rejected: [] });

    const pull = await cashierLaptop.pull(0).expect(200);
    const rows = pull.body.changes.find((c: { table: string }) => c.table === 'settings').rows;
    expect(rows[0].value.hourlyRate).toBe(12_000);
    expect(pull.body.cursor).toBeGreaterThan(0);
  });

  it('pushing the same change twice is safe', async () => {
    await adminLaptop.push([garageSetting(adminDeviceId, 1000, 12_000)]).expect(200);
    const pull = await cashierLaptop.pull(0);
    expect(pull.body.changes[0].rows).toHaveLength(1);
  });

  it('an older change never overwrites a newer one', async () => {
    await adminLaptop.push([garageSetting(adminDeviceId, 3000, 15_000)]);
    const stale = await adminLaptop.push([garageSetting(adminDeviceId, 2000, 9_000)]);
    expect(stale.body.accepted).toEqual(['garage']);
    const pull = await cashierLaptop.pull(0);
    expect(pull.body.changes[0].rows[0].value.hourlyRate).toBe(15_000);
  });

  it('the cashier cannot change settings', async () => {
    const res = await cashierLaptop.push([garageSetting(adminDeviceId, 9000, 1)]).expect(200);
    expect(res.body.rejected[0].reason).toBe('not_allowed');
  });

  it('rejects invalid rows and unknown tables', async () => {
    const bad = garageSetting(adminDeviceId, 9000, -1);
    const res = await adminLaptop.push([bad, { ...bad, table: 'nope' }]);
    expect(res.body.rejected.map((r: { reason: string }) => r.reason)).toEqual([
      'invalid',
      'unknown_table',
    ]);
  });

  it('pulls only what changed after the cursor', async () => {
    const first = await cashierLaptop.pull(0);
    const next = await cashierLaptop.pull(first.body.cursor).expect(200);
    expect(next.body).toMatchObject({ changes: [], hasMore: false, cursor: first.body.cursor });
  });
});
