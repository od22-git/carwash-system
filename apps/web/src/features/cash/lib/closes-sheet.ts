import { cashDifference, type CashCloseRecord } from '@carwash/shared';
import type { SheetSpec } from '../../../shared/lib/excel';
import { formatMonth } from '../../../shared/lib/time-format';

/** The month's closes, one row per day; the difference is negative when short. */
export function closesSheet(month: string, closes: CashCloseRecord[]): SheetSpec {
  return {
    name: 'إغلاق الصندوق',
    title: `إغلاقات الصندوق: ${formatMonth(month)}`,
    columns: [
      { header: 'اليوم' },
      { header: 'الفكة', money: true },
      { header: 'دخل الصندوق', money: true },
      { header: 'مدفوع من الصندوق', money: true },
      { header: 'المعدود', money: true },
      { header: 'الفرق', money: true },
      { header: 'أغلقه' },
      { header: 'ملاحظة' },
    ],
    rows: closes.map((c) => [
      c.day,
      c.float,
      c.expected,
      c.paidOut,
      c.counted,
      cashDifference(c),
      c.closedBy,
      c.note,
    ]),
    totals: ['المجموع', null, null, null, null, closes.reduce((s, c) => s + cashDifference(c), 0)],
  };
}
