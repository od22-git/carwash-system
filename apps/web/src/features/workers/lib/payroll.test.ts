import type { TicketRecord, WorkerPaymentRecord, WorkerRecord } from '@carwash/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../core/db';
import { freshLaptop } from '../../../core/sync/test-helpers';
import { deleteWorkerPayment, recordWorkerPayment } from './payment-actions';
import { payrollRows } from './payroll';

const base = { createdAt: 1, updatedAt: 1, deviceId: 'd', deletedAt: null };
const worker = (id: string, payType: WorkerRecord['payType'], rate: number) =>
  ({ ...base, id, name: id, phone: '', payType, rate, active: true }) as WorkerRecord;

const day = (d: number, h = 10) => new Date(2026, 9, d, h).getTime();
const ticket = (workerId: string, at: number, status: TicketRecord['status'], price = 30_000) =>
  ({
    ...base,
    id: `${workerId}-${at}-${status}`,
    workerId,
    status,
    arrivedAt: at,
    startedAt: at,
    lines: [{ serviceId: 's', name: 'غسيل', price }],
    washTotal: 0,
  }) as TicketRecord;

const pay = (workerId: string, amount: number) =>
  ({
    ...base,
    id: `p-${amount}`,
    workerId,
    kind: 'advance',
    amount,
    at: day(5),
  }) as WorkerPaymentRecord;

describe('payrollRows', () => {
  const tickets = [
    ticket('ali', day(3), 'delivered'),
    ticket('ali', day(3, 15), 'grace'),
    ticket('ali', day(10), 'delivered'),
    ticket('ali', day(10), 'washing'),
    ticket('ali', day(10), 'cancelled'),
  ];

  it('commission on the service prices of washed cars, even a free package wash', () => {
    const [row] = payrollRows([worker('ali', 'commission', 30)], tickets, []);
    expect(row).toMatchObject({ cars: 3, washRevenue: 90_000, gross: 27_000, due: 27_000 });
  });

  it('fixed daily pays the days with cars; weekly pays the weeks (from Saturday)', () => {
    const [daily] = payrollRows([worker('ali', 'fixed_daily', 50_000)], tickets, []);
    expect(daily).toMatchObject({ daysWorked: 2, gross: 100_000 });
    const [weekly] = payrollRows([worker('ali', 'fixed_weekly', 300_000)], tickets, []);
    expect(weekly).toMatchObject({ weeksWorked: 2, gross: 600_000 });
  });

  it('advances and wages already given are taken off', () => {
    const payments = [pay('ali', 10_000), { ...pay('ali', 5_000), deletedAt: 9 }];
    const [row] = payrollRows([worker('ali', 'commission', 30)], tickets, payments);
    expect(row).toMatchObject({ paid: 10_000, due: 17_000 });
  });
});

describe('worker payments', () => {
  beforeEach(freshLaptop);
  const owner = { id: 'u1', name: 'المالك', username: 'owner', role: 'admin' as const };

  it('records an advance, and a deletion is logged', async () => {
    const input = {
      workerId: 'ali',
      kind: 'advance' as const,
      amount: 20_000,
      at: day(5),
      note: '',
    };
    const advance = await recordWorkerPayment(input);
    await deleteWorkerPayment(advance, worker('ali', 'commission', 30), owner);
    expect((await db.workerPayments.get(advance.id))?.deletedAt).toBeTypeOf('number');
    const [event] = await db.auditEvents.toArray();
    expect(event).toMatchObject({
      action: 'worker-payment.delete',
      summary: 'سلفة ali (20,000 ل.س)',
    });
  });

  it('asks for the worker and the amount', async () => {
    const input = { workerId: '', kind: 'wage' as const, amount: 1, at: 1, note: '' };
    await expect(recordWorkerPayment(input)).rejects.toThrow('اختر العامل.');
    await expect(recordWorkerPayment({ ...input, workerId: 'ali', amount: 0 })).rejects.toThrow(
      'اكتب المبلغ.',
    );
  });
});
