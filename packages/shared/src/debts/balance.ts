import type { SYP } from '../common';
import type { ParkingSessionRecord } from '../garage';
import type { TicketRecord } from '../tickets';
import type { DebtPaymentRecord } from './debt-payment-record';

type Receipt =
  | 'id'
  | 'customerId'
  | 'customerName'
  | 'receiptNo'
  | 'plate'
  | 'status'
  | 'paidLater'
  | 'deletedAt';

export interface DebtInput {
  tickets: Pick<TicketRecord, Receipt | 'total' | 'deliveredAt'>[];
  parkingSessions: Pick<ParkingSessionRecord, Receipt | 'fee' | 'leftAt'>[];
  payments: Pick<DebtPaymentRecord, 'customerId' | 'customerName' | 'amount' | 'deletedAt'>[];
}

/** A wash or garage receipt the customer took on credit. */
export interface OwedReceipt {
  id: string;
  customerId: string;
  customerName: string;
  receiptNo: string;
  plate: string;
  kind: 'wash' | 'garage';
  amount: SYP;
  at: number;
}

/**
 * Receipts taken on credit and still valid: a cancelled receipt is no longer owed,
 * so cancelling it clears the debt by itself.
 */
export function owedReceipts(input: Pick<DebtInput, 'tickets' | 'parkingSessions'>): OwedReceipt[] {
  const owed: OwedReceipt[] = [];
  for (const t of input.tickets) {
    if (t.deletedAt || !t.paidLater || t.status !== 'delivered' || t.deliveredAt === null) continue;
    owed.push({ ...pickReceipt(t), kind: 'wash', amount: t.total, at: t.deliveredAt });
  }
  for (const s of input.parkingSessions) {
    if (s.deletedAt || !s.paidLater || s.status !== 'left' || s.leftAt === null) continue;
    owed.push({ ...pickReceipt(s), kind: 'garage', amount: s.fee, at: s.leftAt });
  }
  return owed.sort((a, b) => b.at - a.at);
}

const pickReceipt = (
  r: Pick<OwedReceipt, 'id' | 'customerId' | 'customerName' | 'receiptNo' | 'plate'>,
) => ({
  id: r.id,
  customerId: r.customerId,
  customerName: r.customerName,
  receiptNo: r.receiptNo,
  plate: r.plate,
});

export interface DebtBalance {
  customerId: string;
  customerName: string;
  owed: SYP;
  paid: SYP;
  /** What the customer still owes (negative = paid ahead). */
  balance: SYP;
}

/** Every customer with credit receipts or payments, largest debt first. */
export function debtBalances(input: DebtInput): DebtBalance[] {
  const byCustomer = new Map<string, DebtBalance>();
  const get = (customerId: string, customerName: string) => {
    const found = byCustomer.get(customerId) ?? {
      customerId,
      customerName,
      owed: 0,
      paid: 0,
      balance: 0,
    };
    byCustomer.set(customerId, found);
    return found;
  };
  for (const r of owedReceipts(input)) get(r.customerId, r.customerName).owed += r.amount;
  for (const p of input.payments) {
    if (!p.deletedAt) get(p.customerId, p.customerName).paid += p.amount;
  }
  const all = [...byCustomer.values()].map((b) => ({ ...b, balance: b.owed - b.paid }));
  return all.sort((a, b) => b.balance - a.balance);
}
