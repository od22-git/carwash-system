import { useState } from 'react';
import {
  dayRange,
  fromDateInput,
  monthRange,
  toDateInput,
  toMonthInput,
} from '../../../shared/lib/date-input';
import { formatDate, formatMonth } from '../../../shared/lib/time-format';
import { Button, PageHeader, PeriodSection } from '../../../shared/ui';
import { LowStockNotice } from '../components/levels/LowStockNotice';
import { StockTable } from '../components/levels/StockTable';
import { MovementsList } from '../components/history/MovementsList';
import { PeriodReport } from '../components/reports/PeriodReport';
import { WASTE_DAY_COLUMNS, WASTE_MONTH_COLUMNS } from '../lib/report-columns';
import { WasteSummary } from '../components/reports/WasteSummary';
import { StockPanels, type StockPanel } from '../components/StockPanels';
import { StockContext } from '../hooks/stock-context';
import { useStockContextValue } from '../hooks/use-stock-context-value';

const KINDS = ['consumable'] as const;

/** Wash materials: bought, counted every evening; what is missing is the day's waste. */
export function WastePage() {
  const context = useStockContextValue(KINDS);
  const [panel, setPanel] = useState<StockPanel>(null);
  const [day, setDay] = useState(() => toDateInput(Date.now()));
  const [month, setMonth] = useState(() => toMonthInput(Date.now()));
  if (!context) return null;
  const [dayFrom, dayTo] = dayRange(fromDateInput(day, Date.now()));
  const [monthFrom, monthTo] = monthRange(month);

  return (
    <StockContext.Provider value={context}>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="مواد الهدر"
          actions={
            <>
              <Button onClick={() => setPanel({ type: 'count' })}>الجرد المسائي</Button>
              <Button variant="secondary" onClick={() => setPanel({ type: 'purchase' })}>
                شراء مواد
              </Button>
              <Button variant="secondary" onClick={() => setPanel({ type: 'product' })}>
                مادة جديدة
              </Button>
            </>
          }
        />
        <StockPanels
          panel={panel}
          onClose={() => setPanel(null)}
          newTitle="مادة جديدة"
          countTitle="الجرد المسائي"
          countHint="اكتب ما بقي من كل مادة الآن. الفرق عن المتوقع هو هدر اليوم، ويُحسب بمتوسط كلفة الشراء."
          wasteLabel="الهدر"
        />
        <LowStockNotice />
        {context.rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line p-6 text-muted">
            لا توجد مواد بعد. أضف مواد الغسيل (شامبو، ملمّع، ورق، مازوت…) ثم سجّل شراءها.
          </p>
        ) : (
          <StockTable
            rows={context.rows}
            onEdit={(id) => setPanel({ type: 'product', productId: id })}
            onBuy={(id) => setPanel({ type: 'purchase', productId: id })}
          />
        )}
        <PeriodSection title="هدر اليوم" type="date" value={day} onChange={setDay}>
          <WasteSummary from={dayFrom} to={dayTo} />
          <PeriodReport
            fileName={`الهدر ${day}`}
            title={`الهدر: ${formatDate(dayFrom)}`}
            columns={WASTE_DAY_COLUMNS}
            from={dayFrom}
            to={dayTo}
          />
        </PeriodSection>
        <PeriodSection title="التقرير الشهري" type="month" value={month} onChange={setMonth}>
          <WasteSummary from={monthFrom} to={monthTo} />
          <PeriodReport
            fileName={`الهدر ${month}`}
            title={`الهدر: ${formatMonth(month)}`}
            columns={WASTE_MONTH_COLUMNS}
            from={monthFrom}
            to={monthTo}
          />
          <h3 className="font-semibold">حركات الشهر</h3>
          <MovementsList from={monthFrom} to={monthTo} />
        </PeriodSection>
      </div>
    </StockContext.Provider>
  );
}
