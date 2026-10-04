import type { SYP } from '../common';
import type { ParkingSessionRecord } from '../garage';
import type { SaleRecord } from '../stock';
import type { SubscriptionRecord } from '../subscriptions';
import type { TicketRecord } from '../tickets';

export const REVENUE_SOURCES = ['wash', 'garage', 'packages', 'stock', 'buffet'] as const;
export type RevenueSource = (typeof REVENUE_SOURCES)[number];

export const REVENUE_SOURCE_LABELS: Record<RevenueSource, string> = {
  wash: 'الغسيل',
  garage: 'الكراج',
  packages: 'الباقات',
  stock: 'منتجات السيارات',
  buffet: 'البوفيه',
};

export interface RevenueInput {
  tickets: Pick<TicketRecord, 'status' | 'deliveredAt' | 'washTotal' | 'garageFee' | 'deletedAt'>[];
  parkingSessions: Pick<ParkingSessionRecord, 'status' | 'leftAt' | 'fee' | 'deletedAt'>[];
  subscriptions: Pick<SubscriptionRecord, 'status' | 'createdAt' | 'price' | 'deletedAt'>[];
  sales: Pick<SaleRecord, 'status' | 'soldAt' | 'lines' | 'deletedAt'>[];
}

export type RevenueBySource = Record<RevenueSource, SYP>;

const between = (at: number | null, from: number, to: number) =>
  at !== null && at >= from && at < to;

/**
 * Income in [from, to), counted when it is earned: a wash and its late-pickup fee when the
 * car is delivered, a garage stay when the car leaves, a package when sold, a sale when paid.
 * Cancelled receipts are left out.
 */
export function revenueBySource(input: RevenueInput, from: number, to: number): RevenueBySource {
  const r: RevenueBySource = { wash: 0, garage: 0, packages: 0, stock: 0, buffet: 0 };
  for (const t of input.tickets) {
    if (t.deletedAt || t.status !== 'delivered' || !between(t.deliveredAt, from, to)) continue;
    r.wash += t.washTotal;
    r.garage += t.garageFee;
  }
  for (const p of input.parkingSessions) {
    if (!p.deletedAt && p.status === 'left' && between(p.leftAt, from, to)) r.garage += p.fee;
  }
  for (const s of input.subscriptions) {
    if (!s.deletedAt && s.status !== 'cancelled' && between(s.createdAt, from, to)) {
      r.packages += s.price;
    }
  }
  for (const sale of input.sales) {
    if (sale.deletedAt || sale.status !== 'paid' || !between(sale.soldAt, from, to)) continue;
    for (const line of sale.lines) r[line.kind] += line.total;
  }
  return r;
}

export const totalOf = (amounts: Record<string, SYP>): SYP =>
  Object.values(amounts).reduce((sum, n) => sum + n, 0);
