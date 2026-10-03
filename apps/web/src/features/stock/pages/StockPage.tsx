import { PRODUCT_KIND_LABELS, SELLABLE_KINDS, type SellableKind } from '@carwash/shared';
import { useState } from 'react';
import { monthRange, toMonthInput } from '../../../shared/lib/date-input';
import { Button, ChoiceGroup, PageHeader } from '../../../shared/ui';
import { MovementsList } from '../components/history/MovementsList';
import { LowStockNotice } from '../components/levels/LowStockNotice';
import { StockTable } from '../components/levels/StockTable';
import { PeriodReport } from '../components/reports/PeriodReport';
import { PeriodSection } from '../components/reports/PeriodSection';
import { SALES_COLUMNS } from '../components/reports/report-columns';
import { StockPanels, type StockPanel } from '../components/StockPanels';
import { StockContext } from '../hooks/stock-context';
import { useStockContextValue } from '../hooks/use-stock-context-value';

type Filter = SellableKind | 'all';
const FILTERS = [
  { value: 'all' as const, label: 'الكل' },
  ...SELLABLE_KINDS.map((k) => ({ value: k, label: PRODUCT_KIND_LABELS[k] })),
];

/** Car products and buffet: what is in stock, purchases, losses, and the month's report. */
export function StockPage() {
  const context = useStockContextValue(SELLABLE_KINDS);
  const [panel, setPanel] = useState<StockPanel>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [month, setMonth] = useState(() => toMonthInput(Date.now()));
  if (!context) return null;
  const rows = context.rows.filter((r) => filter === 'all' || r.product.kind === filter);
  const [from, to] = monthRange(month);

  return (
    <StockContext.Provider value={context}>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="المخزون والبوفيه"
          actions={
            <>
              <Button onClick={() => setPanel({ type: 'purchase' })}>شراء بضاعة</Button>
              <Button variant="secondary" onClick={() => setPanel({ type: 'product' })}>
                صنف جديد
              </Button>
              <Button variant="secondary" onClick={() => setPanel({ type: 'damage' })}>
                تالف
              </Button>
              <Button variant="secondary" onClick={() => setPanel({ type: 'count' })}>
                جرد
              </Button>
            </>
          }
        />
        <StockPanels
          panel={panel}
          onClose={() => setPanel(null)}
          newTitle="صنف جديد"
          countTitle="جرد المخزون"
          countHint="اكتب العدد الموجود فعلاً لكل صنف. الفرق عن المتوقع يُسجَّل فقداً بمتوسط كلفة الشراء."
          wasteLabel="الفقد"
        />
        <LowStockNotice />
        <ChoiceGroup
          legend="عرض"
          hideLegend
          choices={FILTERS}
          value={filter}
          onChange={setFilter}
        />
        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line p-6 text-muted">
            لا توجد أصناف بعد. أضف منتجات السيارات وأصناف البوفيه مع أسعار البيع.
          </p>
        ) : (
          <StockTable
            rows={rows}
            onEdit={(id) => setPanel({ type: 'product', productId: id })}
            onBuy={(id) => setPanel({ type: 'purchase', productId: id })}
          />
        )}
        <PeriodSection title="التقرير الشهري" type="month" value={month} onChange={setMonth}>
          <PeriodReport columns={SALES_COLUMNS} from={from} to={to} />
          <h3 className="font-semibold">حركات الشهر</h3>
          <MovementsList from={from} to={to} />
        </PeriodSection>
      </div>
    </StockContext.Provider>
  );
}
