import { ApiClient } from './api-client';
import { createTestApp } from './create-test-app';
import { resetDatabase } from './reset-database';

/** A fresh server with the owner's laptop and the cashier's laptop registered. */
export async function twoLaptops() {
  await resetDatabase();
  const app = await createTestApp();
  const api = new ApiClient(app);
  const owner = await api.setupAdmin();
  const user = await api.createUser(owner.token, 'cashier', 'user');
  const adminDevice = (await api.registerDevice(owner.token)).id;
  const cashierDevice = (await api.registerDevice(user.token)).id;
  return {
    app,
    admin: api.as(owner.token, adminDevice),
    cashier: api.as(user.token, cashierDevice),
    adminDevice,
    cashierDevice,
  };
}

export type Laptops = Awaited<ReturnType<typeof twoLaptops>>;

/** The fields every synced row has. */
export const syncBase = (id: string, deviceId: string, updatedAt = 1) => ({
  id,
  createdAt: 1,
  updatedAt,
  deviceId,
  deletedAt: null,
});

export const rejectedReasons = (res: { body: { rejected: { reason: string }[] } }) =>
  res.body.rejected.map((r) => r.reason);

type PullBody = { changes: { table: string; rows: Record<string, unknown>[] }[] };
export const pulledRows = (body: PullBody, table: string) =>
  body.changes.find((c) => c.table === table)?.rows ?? [];
