import type { WorkerPaymentRecord, WorkerRecord } from '@carwash/shared';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../core/db';
import { payrollRows, washedAt, type PayrollRow } from '../lib/payroll';

const DAY = 86_400_000;

export interface Payroll {
  rows: PayrollRow[];
  payments: WorkerPaymentRecord[];
}

/** Pay for every worker in [from, to), and the payments given in it. Admin laptop only. */
export function usePayroll(from: number, to: number): Payroll | undefined {
  return useLiveQuery(async () => {
    const [workers, tickets, payments] = await Promise.all([
      db.workers.toArray(),
      // A car that arrived just before `from` may have been washed inside the period.
      db.tickets
        .where('arrivedAt')
        .between(from - DAY, to, true, false)
        .toArray(),
      db.workerPayments.where('at').between(from, to, true, false).toArray(),
    ]);
    const paid = workers.filter((w): w is WorkerRecord => !w.deletedAt && w.payType !== undefined);
    const inPeriod = tickets.filter((t) => washedAt(t) >= from && washedAt(t) < to);
    const live = payments.filter((p) => !p.deletedAt).sort((a, b) => b.at - a.at);
    const rows = payrollRows(paid, inPeriod, live).filter(
      (r) => r.worker.active || r.cars || r.paid,
    );
    return { rows, payments: live };
  }, [from, to]);
}
