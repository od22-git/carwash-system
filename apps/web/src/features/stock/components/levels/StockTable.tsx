import { formatSYP, PRODUCT_KIND_LABELS } from '@carwash/shared';
import { Button, Table } from '../../../../shared/ui';
import { useStock } from '../../hooks/stock-context';
import { describeLevel, type StockRow } from '../../lib/stock-rows';
import { StatusBadge } from './StatusBadge';

interface StockTableProps {
  rows: StockRow[];
  onEdit: (productId: string) => void;
  onBuy: (productId: string) => void;
}

/** What is on the shelf now, what it cost, and what needs buying. */
export function StockTable({ rows, onEdit, onBuy }: StockTableProps) {
  const { kinds } = useStock();
  const showKind = kinds.length > 1;
  const headers = [
    'الصنف',
    ...(showKind ? ['النوع'] : []),
    'الكمية',
    'حد التنبيه',
    'متوسط الكلفة',
    'القيمة',
    'الحالة',
    '',
  ];

  return (
    <section aria-label="الأصناف">
      <Table headers={headers} minWidth="52rem">
        {rows.map((row) => (
          <tr
            key={row.product.id}
            className={`border-b border-line last:border-0 ${row.product.active ? '' : 'text-muted'}`}
          >
            <td className="px-3 py-2 font-semibold">{row.product.name}</td>
            {showKind && <td className="px-3 py-2">{PRODUCT_KIND_LABELS[row.product.kind]}</td>}
            <td className="px-3 py-2 tabular-nums">{describeLevel(row)}</td>
            <td className="px-3 py-2 tabular-nums">{row.product.minQty}</td>
            <td className="px-3 py-2 tabular-nums">
              {row.unitCost ? formatSYP(row.unitCost) : '—'}
            </td>
            <td className="px-3 py-2 tabular-nums">{formatSYP(row.value)}</td>
            <td className="px-3 py-2">
              <StatusBadge status={row.status} active={row.product.active} />
            </td>
            <td className="flex gap-1 px-3 py-1">
              {row.product.active && (
                <Button variant="quiet" onClick={() => onBuy(row.product.id)}>
                  شراء
                </Button>
              )}
              <Button variant="quiet" onClick={() => onEdit(row.product.id)}>
                تعديل
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </section>
  );
}
