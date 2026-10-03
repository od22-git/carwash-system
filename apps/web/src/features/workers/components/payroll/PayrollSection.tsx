import { useState } from 'react';
import { periodRange, todayPeriod, type Period } from '../../../../shared/lib/period';
import { PeriodPicker, RegisterPanel } from '../../../../shared/ui';
import { usePayroll } from '../../hooks/use-payroll';
import type { PayrollRow } from '../../lib/payroll';
import { PaymentForm } from './PaymentForm';
import { PaymentsList } from './PaymentsList';
import { PayrollTable } from './PayrollTable';

type Paying = { workerId?: string; suggested?: number } | null;

/** Cars and pay per worker for a day, a week or a month; advances and wages given. */
export function PayrollSection() {
  const [period, setPeriod] = useState<Period>(() => todayPeriod('month'));
  const [paying, setPaying] = useState<Paying>(null);
  const [from, to] = periodRange(period);
  const payroll = usePayroll(from, to);
  const payRow = (row: PayrollRow) =>
    setPaying({ workerId: row.worker.id, suggested: row.due > 0 ? row.due : undefined });

  return (
    <section aria-label="الأجور" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">الأجور</h2>
        <PeriodPicker value={period} onChange={setPeriod} />
      </div>
      {paying && (
        <RegisterPanel title="دفعة لعامل" onClose={() => setPaying(null)}>
          <PaymentForm key={paying.workerId ?? 'any'} {...paying} onDone={() => setPaying(null)} />
        </RegisterPanel>
      )}
      {payroll && (
        <>
          <PayrollTable rows={payroll.rows} onPay={payRow} />
          <h3 className="font-semibold">السلف والدفعات في هذه الفترة</h3>
          <PaymentsList payments={payroll.payments} />
        </>
      )}
    </section>
  );
}
