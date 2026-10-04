import { useState } from 'react';
import { useSessionUser } from '../../../core/auth';
import { toDateInput, toMonthInput } from '../../../shared/lib/date-input';
import { PageHeader, PeriodSection } from '../../../shared/ui';
import { CashSummary } from '../components/CashSummary';
import { CloseForm } from '../components/CloseForm';
import { ClosedCard } from '../components/ClosedCard';
import { MonthCloses } from '../components/MonthCloses';
import { useCashDay } from '../hooks/use-cash-day';

/** End of the day: what came in, the drawer count, the difference. */
export function CashPage() {
  const user = useSessionUser();
  const [day, setDay] = useState(() => toDateInput(Date.now()));
  const [month, setMonth] = useState(() => toMonthInput(Date.now()));
  const cashDay = useCashDay(day);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="إغلاق الصندوق" />
      <PeriodSection title="صندوق اليوم" type="date" value={day} onChange={setDay}>
        {cashDay && (
          <>
            <CashSummary cash={cashDay.cash} />
            {cashDay.close ? (
              <ClosedCard close={cashDay.close} expectedNow={cashDay.cash.total} />
            ) : (
              <CloseForm
                key={day}
                day={day}
                expected={cashDay.cash.total}
                lastFloat={cashDay.lastFloat}
              />
            )}
          </>
        )}
      </PeriodSection>
      {user?.role === 'admin' && (
        <PeriodSection title="إغلاقات الشهر" type="month" value={month} onChange={setMonth}>
          <MonthCloses month={month} />
        </PeriodSection>
      )}
    </div>
  );
}
