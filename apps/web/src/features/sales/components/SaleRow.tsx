import { formatSYP, type SaleRecord, type SessionUser } from '@carwash/shared';
import { useState } from 'react';
import { formatTime } from '../../../shared/lib/time-format';
import { Button, CancelReceiptForm } from '../../../shared/ui';
import { cancelSale } from '../lib/sale-actions';
import { PrintSaleButton } from './PrintSaleButton';

export const SALE_HEADERS = ['الإيصال', 'الأصناف', 'الوقت', 'المبلغ', ''];

const describeItems = (sale: SaleRecord) =>
  sale.lines.map((l) => (l.quantity > 1 ? `${l.name} × ${l.quantity}` : l.name)).join('، ');

export function SaleRow({ sale, user }: { sale: SaleRecord; user: SessionUser }) {
  const [cancelling, setCancelling] = useState(false);
  const cancelled = sale.status === 'cancelled';

  return (
    <>
      <tr className={`border-b border-line last:border-0 ${cancelled ? 'text-muted' : ''}`}>
        <td className="px-3 py-2">{sale.receiptNo}</td>
        <td className="max-w-80 truncate px-3 py-2">{describeItems(sale)}</td>
        <td className="px-3 py-2 tabular-nums">{formatTime(sale.soldAt)}</td>
        <td className="px-3 py-2 tabular-nums">{cancelled ? 'ملغى' : formatSYP(sale.total)}</td>
        <td className="flex flex-wrap gap-1 px-3 py-1">
          <PrintSaleButton sale={sale} />
          {user.role === 'admin' && !cancelled && !cancelling && (
            <Button variant="quiet" onClick={() => setCancelling(true)}>
              إلغاء الإيصال
            </Button>
          )}
        </td>
      </tr>
      {cancelling && (
        <tr>
          <td colSpan={SALE_HEADERS.length} className="px-3 py-2">
            <CancelReceiptForm
              onConfirm={(reason) => cancelSale(sale, reason, user)}
              onDone={() => setCancelling(false)}
            />
          </td>
        </tr>
      )}
    </>
  );
}
