import type { INestApplication } from '@nestjs/common';
import { ApiClient } from '../../test-utils/api-client';
import { createTestApp } from '../../test-utils/create-test-app';
import { resetDatabase } from '../../test-utils/reset-database';

type Laptop = ReturnType<ApiClient['as']>;

const ticket = (deviceId: string, updatedAt: number, status: string) => ({
  table: 'tickets',
  row: {
    id: 't1',
    createdAt: 1,
    updatedAt,
    deviceId,
    deletedAt: null,
    receiptNo: 'B-000001',
    customerId: 'c1',
    vehicleId: 'v1',
    customerName: 'سامر',
    plate: 'حلب 123456',
    size: 'suv',
    workerId: 'w1',
    status,
    lines: [{ serviceId: 's1', name: 'غسيل سفلي', price: 20000 }],
    washTotal: 20000,
    total: 20000,
    arrivedAt: 1,
  },
});

const reasons = (res: { body: { rejected: { reason: string }[] } }) =>
  res.body.rejected.map((r) => r.reason);

describe('receipts (tickets): who may do what', () => {
  let app: INestApplication;
  let admin: Laptop;
  let cashier: Laptop;
  let cashierDevice: string;

  beforeAll(async () => {
    await resetDatabase();
    app = await createTestApp();
    const api = new ApiClient(app);
    const owner = await api.setupAdmin();
    const user = await api.createUser(owner.token, 'cashier', 'user');
    admin = api.as(owner.token, (await api.registerDevice(owner.token)).id);
    cashierDevice = (await api.registerDevice(user.token)).id;
    cashier = api.as(user.token, cashierDevice);
  });

  afterAll(() => app.close());

  it('the cashier records a car and moves it to delivered', async () => {
    const res = await cashier.push([
      ticket(cashierDevice, 1, 'washing'),
      ticket(cashierDevice, 2, 'delivered'),
    ]);
    expect(res.body.rejected).toEqual([]);
  });

  it('the cashier cannot cancel or change a delivered receipt', async () => {
    const res = await cashier.push([
      ticket(cashierDevice, 3, 'cancelled'),
      ticket(cashierDevice, 3, 'grace'),
    ]);
    expect(reasons(res)).toEqual(['admin_only', 'locked']);
  });

  it('the admin can cancel a delivered receipt, and the event is kept from the cashier', async () => {
    const cancel = await admin.push([
      ticket(cashierDevice, 4, 'cancelled'),
      {
        table: 'auditEvents',
        row: {
          id: 'e1',
          createdAt: 4,
          updatedAt: 4,
          deviceId: cashierDevice,
          deletedAt: null,
          action: 'ticket.cancel',
          userId: 'u1',
          userName: 'owner',
          targetId: 't1',
          summary: 'B-000001',
        },
      },
    ]);
    expect(cancel.body.rejected).toEqual([]);

    const pull = await cashier.pull(0);
    const tables = pull.body.changes.map((c: { table: string }) => c.table);
    expect(tables).toContain('tickets');
    expect(tables).not.toContain('auditEvents');
  });

  it('an audit event can never be rewritten', async () => {
    const res = await admin.push([
      {
        table: 'auditEvents',
        row: {
          id: 'e1',
          createdAt: 4,
          updatedAt: 9,
          deviceId: cashierDevice,
          deletedAt: null,
          action: 'ticket.cancel',
          userId: 'u1',
          userName: 'owner',
          targetId: 't1',
          summary: 'changed',
        },
      },
    ]);
    expect(reasons(res)).toEqual(['append_only']);
  });
});
