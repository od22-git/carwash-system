import { WORKER_PAYMENT_LABELS, type WorkerPaymentRecord } from '@carwash/shared';
import type { SheetSpec } from '../../../shared/lib/excel';
import { formatDate } from '../../../shared/lib/time-format';
import { describePay } from './describe-pay';
import type { PayrollRow } from './payroll';

const sum = (rows: PayrollRow[], pick: (r: PayrollRow) => number) =>
  rows.reduce((total, r) => total + pick(r), 0);

/** The pay table and the period's payments, as on the workers screen. */
export function payrollSheets(
  /** The period, e.g. "تشرين الأول 2026". */
  period: string,
  rows: PayrollRow[],
  payments: WorkerPaymentRecord[],
): SheetSpec[] {
  const title = `الأجور: ${period}`;
  const name = (id: string) => rows.find((r) => r.worker.id === id)?.worker.name ?? '—';
  return [
    {
      name: 'الأجور',
      title,
      columns: [
        { header: 'العامل' },
        { header: 'الأجر' },
        { header: 'السيارات' },
        { header: 'قيمة الغسيل', money: true },
        { header: 'المستحق', money: true },
        { header: 'المدفوع', money: true },
        { header: 'الباقي', money: true },
      ],
      rows: rows.map((r) => [
        r.worker.name,
        describePay(r.worker),
        r.cars,
        r.washRevenue,
        r.gross,
        r.paid,
        r.due,
      ]),
      totals: [
        'المجموع',
        null,
        sum(rows, (r) => r.cars),
        sum(rows, (r) => r.washRevenue),
        sum(rows, (r) => r.gross),
        sum(rows, (r) => r.paid),
        sum(rows, (r) => r.due),
      ],
    },
    {
      name: 'السلف والدفعات',
      title,
      columns: [
        { header: 'التاريخ' },
        { header: 'العامل' },
        { header: 'النوع' },
        { header: 'المبلغ', money: true },
        { header: 'ملاحظة' },
      ],
      rows: payments.map((p) => [
        formatDate(p.at),
        name(p.workerId),
        WORKER_PAYMENT_LABELS[p.kind],
        p.amount,
        p.note,
      ]),
    },
  ];
}
