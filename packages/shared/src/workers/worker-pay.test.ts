import { describe, expect, it } from 'vitest';
import { workerPay, type WorkerPayInput } from '.';

const base: WorkerPayInput = {
  payType: 'commission',
  rate: 30,
  washPrices: [25_000, 35_000, 40_000],
  daysWorked: 6,
  weeksWorked: 1,
  advances: 0,
};

describe('workerPay', () => {
  it('commission = percent of the wash prices', () => {
    const r = workerPay(base);
    expect(r).toMatchObject({ cars: 3, washRevenue: 100_000, gross: 30_000, net: 30_000 });
  });

  it('fixed daily ignores the number of cars', () => {
    expect(workerPay({ ...base, payType: 'fixed_daily', rate: 50_000 }).gross).toBe(300_000);
  });

  it('fixed weekly pays per week', () => {
    expect(workerPay({ ...base, payType: 'fixed_weekly', rate: 280_000 }).gross).toBe(280_000);
  });

  it('subtracts advances', () => {
    expect(workerPay({ ...base, advances: 10_000 }).net).toBe(20_000);
  });

  it('rejects an impossible commission', () => {
    expect(() => workerPay({ ...base, rate: 150 })).toThrow();
  });
});
