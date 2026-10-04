import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../core/db';
import { freshLaptop } from '../../../core/sync/test-helpers';
import { deleteDebtPayment, recordDebtPayment } from './debt-actions';

const owner = { id: 'u1', name: 'المالك', username: 'owner', role: 'admin' as const };
const customer = { id: 'c1', name: 'سامر' };

describe('debt payments', () => {
  beforeEach(freshLaptop);

  it('a payment gets the next receipt number and is synced', async () => {
    const payment = await recordDebtPayment(customer, 75_000, ' نقداً ');
    expect(payment).toMatchObject({
      receiptNo: 'A-000001',
      customerId: 'c1',
      customerName: 'سامر',
      amount: 75_000,
      note: 'نقداً',
    });
    expect(await db.outbox.count()).toBe(1);
  });

  it('refuses a payment without an amount', async () => {
    await expect(recordDebtPayment(customer, 0, '')).rejects.toThrow('اكتب المبلغ المدفوع.');
    await expect(recordDebtPayment(customer, Number.NaN, '')).rejects.toThrow();
  });

  it('the admin deletes a wrong payment, and it is logged', async () => {
    const payment = await recordDebtPayment(customer, 20_000, '');
    await deleteDebtPayment(payment, owner);
    expect((await db.debtPayments.get(payment.id))?.deletedAt).not.toBeNull();
    const [event] = await db.auditEvents.toArray();
    expect(event).toMatchObject({
      action: 'debt-payment.delete',
      summary: 'A-000001 سامر (20,000 ل.س)',
    });
  });
});
