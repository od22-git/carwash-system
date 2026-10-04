import type { SYP } from '../common';
import type { DebtPaymentRecord } from '../debts';
import { revenueBySource, totalOf, type RevenueInput } from '../finance';
import type { ParkingSessionRecord } from '../garage';
import type { TicketRecord } from '../tickets';

export interface CashInput extends RevenueInput {
  tickets: (RevenueInput['tickets'][number] & Pick<TicketRecord, 'paidLater'>)[];
  parkingSessions: (RevenueInput['parkingSessions'][number] &
    Pick<ParkingSessionRecord, 'paidLater'>)[];
  debtPayments: Pick<DebtPaymentRecord, 'amount' | 'at' | 'deletedAt'>[];
}

export interface CashIn {
  wash: SYP;
  garage: SYP;
  packages: SYP;
  /** Car products and buffet sold at the counter. */
  sales: SYP;
  /** Customers paying what they owed. */
  debtPayments: SYP;
  /** What should be in the drawer from the day's receipts. */
  total: SYP;
  /** Earned but taken on the customers' accounts: not in the drawer. */
  onAccount: SYP;
}

/** Cash that came in during [from, to): the day's income, less credit, plus debts paid. */
export function cashIn(input: CashInput, from: number, to: number): CashIn {
  const paidNow = revenueBySource(
    {
      ...input,
      tickets: input.tickets.filter((t) => !t.paidLater),
      parkingSessions: input.parkingSessions.filter((p) => !p.paidLater),
    },
    from,
    to,
  );
  const credit = revenueBySource(
    {
      tickets: input.tickets.filter((t) => t.paidLater),
      parkingSessions: input.parkingSessions.filter((p) => p.paidLater),
      subscriptions: [],
      sales: [],
    },
    from,
    to,
  );
  const debtPayments = input.debtPayments
    .filter((p) => !p.deletedAt && p.at >= from && p.at < to)
    .reduce((sum, p) => sum + p.amount, 0);
  const sales = paidNow.stock + paidNow.buffet;
  const { wash, garage, packages } = paidNow;
  return {
    wash,
    garage,
    packages,
    sales,
    debtPayments,
    total: wash + garage + packages + sales + debtPayments,
    onAccount: totalOf(credit),
  };
}
