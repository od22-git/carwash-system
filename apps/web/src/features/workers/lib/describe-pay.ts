import { formatSYP, type WorkerPublic } from '@carwash/shared';

/** "عمولة 30% من سعر الغسلة" / "75,000 ل.س يومياً". Dash when pay is hidden (cashier laptop). */
export function describePay(worker: Pick<WorkerPublic, 'payType' | 'rate'>): string {
  if (worker.payType === undefined || worker.rate === undefined) return '—';
  switch (worker.payType) {
    case 'commission':
      return `عمولة ${worker.rate}% من سعر الغسلة`;
    case 'fixed_daily':
      return `${formatSYP(worker.rate)} يومياً`;
    case 'fixed_weekly':
      return `${formatSYP(worker.rate)} أسبوعياً`;
  }
}
