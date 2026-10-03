import {
  sumLines,
  workerPay,
  type TicketRecord,
  type WorkerPaymentRecord,
  type WorkerPayResult,
  type WorkerRecord,
} from '@carwash/shared';
import { startOfDay } from '../../../shared/lib/time-format';
import { startOfWeek } from '../../../shared/lib/week';

/** One worker's line in the pay table for a period. */
export interface PayrollRow extends WorkerPayResult {
  worker: WorkerRecord;
  daysWorked: number;
  weeksWorked: number;
}

/** A car counts for its worker once washed (waiting for pickup or delivered). */
const WASHED: TicketRecord['status'][] = ['grace', 'delivered'];

export const washedAt = (t: TicketRecord) => t.startedAt ?? t.arrivedAt;

export const isWashed = (t: TicketRecord) => !t.deletedAt && WASHED.includes(t.status);

/**
 * Pay for each worker in a period. The commission is on the services' prices (the work
 * done), even when a package made the wash free for the customer.
 */
export function payrollRows(
  workers: WorkerRecord[],
  tickets: TicketRecord[],
  payments: WorkerPaymentRecord[],
): PayrollRow[] {
  return workers.map((worker) => {
    const cars = tickets.filter((t) => t.workerId === worker.id && isWashed(t));
    const paid = payments
      .filter((p) => p.workerId === worker.id && !p.deletedAt)
      .reduce((sum, p) => sum + p.amount, 0);
    const daysWorked = new Set(cars.map((t) => startOfDay(washedAt(t)))).size;
    const weeksWorked = new Set(cars.map((t) => startOfWeek(washedAt(t)))).size;
    const pay = workerPay({
      payType: worker.payType,
      rate: worker.rate,
      washPrices: cars.map((t) => sumLines(t.lines)),
      daysWorked,
      weeksWorked,
      paid,
    });
    return { worker, daysWorked, weeksWorked, ...pay };
  });
}
