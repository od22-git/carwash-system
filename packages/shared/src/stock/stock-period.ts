import type { SYP } from '../common';
import { levelAt, type LedgerEntry, type LedgerEntryType } from './ledger';

/** What happened to one product between `from` and `to` (a day or a month). */
export interface PeriodSummary {
  opening: number;
  purchased: number;
  purchaseCost: SYP;
  /** Units sold (sellable products). */
  sold: number;
  revenue: SYP;
  /** Net units the counts found missing (for wash materials: the waste). */
  countLoss: number;
  countLossValue: SYP;
  damaged: number;
  damagedValue: SYP;
  closing: number;
  /** The last count in the period (units found), or null when it was not counted. */
  lastCounted: number | null;
}

const sum = (entries: LedgerEntry[], type: LedgerEntryType, field: 'qty' | 'value' | 'revenue') =>
  entries.filter((e) => e.type === type).reduce((total, e) => total + e[field], 0);

/** Outgoing amounts as positive numbers (and a plain 0, never -0). */
const out = (entries: LedgerEntry[], type: LedgerEntryType, field: 'qty' | 'value') =>
  0 - sum(entries, type, field) || 0;

export function periodSummary(entries: LedgerEntry[], from: number, to: number): PeriodSummary {
  const inPeriod = entries.filter((e) => e.at >= from && e.at < to);
  const counts = inPeriod.filter((e) => e.type === 'count');
  return {
    opening: levelAt(entries, from),
    purchased: sum(inPeriod, 'purchase', 'qty'),
    purchaseCost: sum(inPeriod, 'purchase', 'value'),
    sold: out(inPeriod, 'sale', 'qty'),
    revenue: sum(inPeriod, 'sale', 'revenue'),
    countLoss: out(inPeriod, 'count', 'qty'),
    countLossValue: out(inPeriod, 'count', 'value'),
    damaged: out(inPeriod, 'damage', 'qty'),
    damagedValue: out(inPeriod, 'damage', 'value'),
    closing: levelAt(entries, to),
    lastCounted: counts.at(-1)?.counted ?? null,
  };
}
