import {
  formatSYP,
  saleTotal,
  type SaleLine,
  type SaleRecord,
  type SessionUser,
} from '@carwash/shared';
import { logAudit } from '../../../core/audit';
import { nextReceiptNo } from '../../../core/db';
import { saveRecord } from '../../../core/sync';
import { UserError } from '../../../shared/lib/user-error';

/** The customer pays: the sale is saved with this laptop's next receipt number. */
export async function completeSale(lines: SaleLine[]): Promise<SaleRecord> {
  if (lines.length === 0) throw new UserError('السلة فارغة. أضف صنفاً أولاً.');
  const row = {
    receiptNo: await nextReceiptNo(),
    lines,
    total: saleTotal(lines),
    status: 'paid',
    soldAt: Date.now(),
  };
  return (await saveRecord('sales', row)) as SaleRecord;
}

/** Admin only. The receipt stays (marked cancelled), its items go back into stock, and it is logged. */
export async function cancelSale(sale: SaleRecord, reason: string, user: SessionUser) {
  const row = {
    id: sale.id,
    status: 'cancelled',
    cancelledAt: Date.now(),
    cancelReason: reason.trim(),
  };
  const cancelled = (await saveRecord('sales', row)) as SaleRecord;
  await logAudit({
    action: 'sale.cancel',
    user,
    targetId: sale.id,
    summary: `${sale.receiptNo} (${formatSYP(sale.total)})`,
    reason,
  });
  return cancelled;
}
