import type { SYP } from '../common';
import type { PayType } from './pay-type';

export interface WorkerPayInput {
  payType: PayType;
  /** Amount per day / per week, or the commission percent (30 = 30%). */
  rate: number;
  /** Service prices of the cars this worker washed in the period (garage fees not included). */
  washPrices: SYP[];
  /** Days in the period with at least one car (fixed daily pay). */
  daysWorked: number;
  /** Weeks in the period with at least one car (fixed weekly pay). */
  weeksWorked: number;
  /** Advances and wage payments already given in the period. */
  paid: SYP;
}

export interface WorkerPayResult {
  cars: number;
  washRevenue: SYP;
  /** What the worker earned in the period. */
  gross: SYP;
  paid: SYP;
  /** Still owed (negative = paid ahead). */
  due: SYP;
}

function grossPay(input: WorkerPayInput, washRevenue: SYP): SYP {
  switch (input.payType) {
    case 'commission':
      if (input.rate < 0 || input.rate > 100) {
        throw new Error(`Commission percent must be 0-100, got ${input.rate}`);
      }
      return Math.round((washRevenue * input.rate) / 100);
    case 'fixed_daily':
      return input.rate * input.daysWorked;
    case 'fixed_weekly':
      return input.rate * input.weeksWorked;
  }
}

/** A worker is paid fixed (daily or weekly) OR by commission on the wash price, never both. */
export function workerPay(input: WorkerPayInput): WorkerPayResult {
  const washRevenue = input.washPrices.reduce((a, b) => a + b, 0);
  const gross = grossPay(input, washRevenue);
  return {
    cars: input.washPrices.length,
    washRevenue,
    gross,
    paid: input.paid,
    due: gross - input.paid,
  };
}
