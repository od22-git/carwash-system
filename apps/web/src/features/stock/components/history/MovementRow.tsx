import {
  formatSYP,
  MOVEMENT_TYPE_LABELS,
  type ProductRecord,
  type StockMovementRecord,
} from '@carwash/shared';
import { useState } from 'react';
import { formatDate } from '../../../../shared/lib/time-format';
import { useAction } from '../../../../shared/lib/use-action';
import { Button } from '../../../../shared/ui';
import { useStock } from '../../hooks/stock-context';
import { deleteMovement } from '../../lib/movement-actions';

interface MovementRowProps {
  movement: StockMovementRecord;
  product: ProductRecord;
}

export function MovementRow({ movement: m, product }: MovementRowProps) {
  const { user } = useStock();
  const [confirming, setConfirming] = useState(false);
  const action = useAction();
  const details = [m.supplier, m.note, m.counted !== null ? `الموجود ${m.counted}` : '']
    .filter(Boolean)
    .join('، ');

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-3 py-2 tabular-nums">{formatDate(m.at)}</td>
      <td className="px-3 py-2 font-semibold">{product.name}</td>
      <td className="px-3 py-2">{MOVEMENT_TYPE_LABELS[m.type]}</td>
      <td className="px-3 py-2 tabular-nums" dir="ltr">
        <span className="block text-right">{m.qty > 0 ? `+${m.qty}` : m.qty}</span>
      </td>
      <td className="px-3 py-2 tabular-nums">{formatSYP(Math.abs(m.value))}</td>
      <td className="px-3 py-2 text-muted">{details}</td>
      <td className="flex gap-1 px-3 py-1">
        {confirming ? (
          <>
            <Button
              variant="danger"
              disabled={action.busy}
              onClick={() => void action.run(() => deleteMovement(m, product, user))}
            >
              تأكيد الحذف
            </Button>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              تراجع
            </Button>
          </>
        ) : (
          <Button variant="quiet" onClick={() => setConfirming(true)}>
            حذف
          </Button>
        )}
      </td>
    </tr>
  );
}
