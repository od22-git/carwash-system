import {
  debtBalances,
  owedReceipts,
  type DebtBalance,
  type DebtPaymentRecord,
  type OwedReceipt,
} from '@carwash/shared';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../core/db';

export interface CustomerDebt {
  owed: OwedReceipt[];
  payments: DebtPaymentRecord[];
  balance: number;
}

/** One customer's credit receipts, payments and balance (both laptops' records). */
export function useCustomerDebt(customerId: string): CustomerDebt | undefined {
  return useLiveQuery(async () => {
    const [tickets, parkingSessions, payments] = await Promise.all([
      db.tickets.where('customerId').equals(customerId).toArray(),
      db.parkingSessions.where('customerId').equals(customerId).toArray(),
      db.debtPayments.where('customerId').equals(customerId).toArray(),
    ]);
    const owed = owedReceipts({ tickets, parkingSessions });
    const live = payments.filter((p) => !p.deletedAt).sort((a, b) => b.at - a.at);
    const balance = owed.reduce((s, r) => s + r.amount, 0) - live.reduce((s, p) => s + p.amount, 0);
    return { owed, payments: live, balance };
  }, [customerId]);
}

/** Customers who still owe money, largest debt first. */
export function useDebtors(): DebtBalance[] | undefined {
  return useLiveQuery(async () => {
    const [tickets, parkingSessions, payments] = await Promise.all([
      db.tickets.where('status').equals('delivered').toArray(),
      db.parkingSessions.where('status').equals('left').toArray(),
      db.debtPayments.toArray(),
    ]);
    return debtBalances({ tickets, parkingSessions, payments }).filter((b) => b.balance > 0);
  });
}
