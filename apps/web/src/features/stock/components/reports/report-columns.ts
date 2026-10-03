import type { PeriodSummary } from '@carwash/shared';

export interface ReportColumn {
  header: string;
  /** null shows a dash (e.g. a material not counted that day). */
  value: (s: PeriodSummary) => number | null;
  /** Money columns are formatted in SYP and added up in the totals row. */
  money?: boolean;
}

const loss = (s: PeriodSummary) => s.countLoss + s.damaged;
const lossValue = (s: PeriodSummary) => s.countLossValue + s.damagedValue;

/** Car products and buffet, per month. */
export const SALES_COLUMNS: ReportColumn[] = [
  { header: 'أول الشهر', value: (s) => s.opening },
  { header: 'شراء', value: (s) => s.purchased },
  { header: 'كلفة الشراء', value: (s) => s.purchaseCost, money: true },
  { header: 'مباع', value: (s) => s.sold },
  { header: 'المبيعات', value: (s) => s.revenue, money: true },
  { header: 'فقد وتالف', value: loss },
  { header: 'قيمة الفقد', value: lossValue, money: true },
  { header: 'آخر الشهر', value: (s) => s.closing },
];

/** Wash materials, per month: what was used up and what it cost. */
export const WASTE_MONTH_COLUMNS: ReportColumn[] = [
  { header: 'أول الشهر', value: (s) => s.opening },
  { header: 'شراء', value: (s) => s.purchased },
  { header: 'كلفة الشراء', value: (s) => s.purchaseCost, money: true },
  { header: 'الهدر', value: (s) => s.countLoss },
  { header: 'كلفة الهدر', value: (s) => s.countLossValue, money: true },
  { header: 'آخر الشهر', value: (s) => s.closing },
];

/** Wash materials, one day: opening + bought − counted = the day's waste. */
export const WASTE_DAY_COLUMNS: ReportColumn[] = [
  { header: 'بداية اليوم', value: (s) => s.opening },
  { header: 'شراء اليوم', value: (s) => s.purchased },
  { header: 'الجرد المسائي', value: (s) => s.lastCounted },
  { header: 'الهدر', value: (s) => (s.lastCounted === null ? null : s.countLoss) },
  { header: 'كلفة الهدر', value: (s) => s.countLossValue, money: true },
];
