import { Table } from '../../../../shared/ui';
import { productById, useStock } from '../../hooks/stock-context';
import { useMovements } from '../../hooks/use-movements';
import { MovementRow } from './MovementRow';

/** The period's purchases, counts and damage for this screen's products. */
export function MovementsList({ from, to }: { from: number; to: number }) {
  const ctx = useStock();
  const rows = (useMovements(from, to) ?? []).flatMap((movement) => {
    const product = productById(ctx, movement.productId);
    return product ? [{ movement, product }] : [];
  });

  if (rows.length === 0) return <p className="text-muted">لا توجد حركات في هذه الفترة.</p>;
  return (
    <Table
      headers={['التاريخ', 'الصنف', 'الحركة', 'الكمية', 'القيمة', 'تفاصيل', '']}
      minWidth="48rem"
    >
      {rows.map(({ movement, product }) => (
        <MovementRow key={movement.id} movement={movement} product={product} />
      ))}
    </Table>
  );
}
