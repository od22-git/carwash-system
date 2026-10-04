import { describe, expect, it } from 'vitest';
import type { PayrollRow } from './payroll';
import { payrollSheets } from './payroll-sheets';

const row = (name: string, extra: Partial<PayrollRow>) =>
  ({
    worker: { id: name, name, payType: 'commission', rate: 30 },
    cars: 2,
    washRevenue: 70_000,
    gross: 21_000,
    paid: 10_000,
    due: 11_000,
    ...extra,
  }) as PayrollRow;

describe('payroll workbook', () => {
  it('one row per worker with totals, and the payments with worker names', () => {
    const rows = [row('محمد', {}), row('علي', { cars: 1, gross: 75_000, paid: 75_000, due: 0 })];
    const payment = { workerId: 'علي', kind: 'wage', amount: 75_000, at: 1, note: '' };
    const [pay, payments] = payrollSheets('تشرين الأول 2026', rows, [payment as never]);
    expect(pay!.title).toBe('الأجور: تشرين الأول 2026');
    expect(pay!.rows[0]).toEqual([
      'محمد',
      'عمولة 30% من سعر الغسلة',
      2,
      70_000,
      21_000,
      10_000,
      11_000,
    ]);
    expect(pay!.totals).toEqual(['المجموع', null, 3, 140_000, 96_000, 85_000, 11_000]);
    expect(payments!.rows[0]!.slice(1)).toEqual(['علي', 'دفعة أجر', 75_000, '']);
  });
});
