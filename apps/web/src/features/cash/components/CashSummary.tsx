import { formatSYP, type CashIn } from '@carwash/shared';
import { Stats } from '../../../shared/ui';

/** Where the day's cash came from, and what should be in the drawer. */
export function CashSummary({ cash }: { cash: CashIn }) {
  return (
    <div className="flex flex-col gap-2">
      <Stats
        items={[
          { label: 'الغسيل', value: formatSYP(cash.wash) },
          { label: 'الكراج', value: formatSYP(cash.garage) },
          { label: 'الباقات', value: formatSYP(cash.packages) },
          { label: 'المبيعات والبوفيه', value: formatSYP(cash.sales) },
          { label: 'دفعات الديون', value: formatSYP(cash.debtPayments) },
          { label: 'دخل الصندوق', value: formatSYP(cash.total) },
        ]}
      />
      {cash.onAccount > 0 && (
        <p className="text-sm text-muted">
          على الحساب (آجل) اليوم {formatSYP(cash.onAccount)}: لا يدخل الصندوق.
        </p>
      )}
    </div>
  );
}
