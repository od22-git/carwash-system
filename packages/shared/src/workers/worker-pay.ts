import type { SYP } from '../common';
import type { PayType } from './pay-type';

export interface WorkerPayInput {
  payType: PayType;
  /** Amount per day / per week, or the commission percent (30 = 30%). */
  rate: number;
  /** Wash prices of the cars this worker finished in the period (garage fees not included). */
  washPrices: SYP[];
  daysWorked: number;
  weeksWorked: number;
  /** Advances already taken in the period. */
  advances: SYP;
}

export interface WorkerPayResult {
  cars: number;
  washRevenue: SYP;
  gross: SYP;
  advances: SYP;
  net: SYP;
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

export function workerPay(input: WorkerPayInput): WorkerPayResult {
  const washRevenue = input.washPrices.reduce((a, b) => a + b, 0);
  const gross = grossPay(input, washRevenue);
  return {
    cars: input.washPrices.length,
    washRevenue,
    gross,
    advances: input.advances,
    net: gross - input.advances,
  };
}
