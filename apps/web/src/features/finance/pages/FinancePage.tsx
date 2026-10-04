import { formatSYP, totalOf } from '@carwash/shared';
import { useState } from 'react';
import { toMonthInput } from '../../../shared/lib/date-input';
import {
  Button,
  ExportButton,
  PageHeader,
  PeriodSection,
  RegisterPanel,
  Stats,
} from '../../../shared/ui';
import { DebtorsTable, useDebtors } from '../../debts';
import { AuditLog } from '../components/AuditLog';
import { BudgetTable } from '../components/BudgetTable';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpensesList } from '../components/ExpensesList';
import { RevenueTable } from '../components/RevenueTable';
import { useMonthFinance } from '../hooks/use-month-finance';
import { financeSheets } from '../lib/finance-sheets';

/** The owner's month: income by source, spending against budget, the net, and the log. */
export function FinancePage() {
  const [month, setMonth] = useState(() => toMonthInput(Date.now()));
  const [adding, setAdding] = useState(false);
  const finance = useMonthFinance(month);
  const debtors = useDebtors();
  const income = finance ? totalOf(finance.revenue) : 0;
  const spent = finance ? totalOf(finance.expenses) : 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="الحسابات والتقارير"
        actions={<Button onClick={() => setAdding(true)}>مصروف جديد</Button>}
      />
      {adding && (
        <RegisterPanel title="مصروف جديد" onClose={() => setAdding(false)}>
          <ExpenseForm onDone={() => setAdding(false)} />
        </RegisterPanel>
      )}
      <PeriodSection
        title="حساب الشهر"
        type="month"
        value={month}
        onChange={setMonth}
        actions={
          finance && (
            <ExportButton
              fileName={`الحسابات ${month}`}
              sheets={() => financeSheets(month, finance, debtors ?? [])}
            />
          )
        }
      >
        {finance && (
          <>
            <Stats
              items={[
                { label: 'الدخل', value: formatSYP(income) },
                { label: 'المصاريف', value: formatSYP(spent) },
                {
                  label: 'الصافي',
                  value: formatSYP(income - spent),
                  tone: income < spent ? 'bad' : 'normal',
                },
              ]}
            />
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
              <section aria-label="الدخل حسب المصدر" className="flex flex-col gap-3">
                <h3 className="font-semibold">الدخل حسب المصدر</h3>
                <RevenueTable revenue={finance.revenue} />
              </section>
              <section aria-label="المصاريف والميزانية" className="flex flex-col gap-3">
                <h3 className="font-semibold">المصاريف والميزانية</h3>
                <BudgetTable month={month} expenses={finance.expenses} budgets={finance.budgets} />
              </section>
            </div>
            <h3 className="font-semibold">المصاريف الأخرى هذا الشهر</h3>
            <ExpensesList expenses={finance.expenseRows} />
          </>
        )}
      </PeriodSection>
      <section aria-label="ديون العملاء" className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold">ديون العملاء (آجل)</h2>
        <DebtorsTable />
      </section>
      <section aria-label="سجل العمليات الحساسة" className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold">سجل العمليات الحساسة</h2>
        <AuditLog />
      </section>
    </div>
  );
}
