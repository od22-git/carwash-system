import { formatSYP, type ParkingPlanRecord } from '@carwash/shared';
import { Button, Table } from '../../../../shared/ui';

interface PlansTableProps {
  plans: ParkingPlanRecord[];
  onEdit: (id: string) => void;
}

export function PlansTable({ plans, onEdit }: PlansTableProps) {
  return (
    <Table headers={['الخطة', 'المدة', 'السعر', '']}>
      {plans.map((p) => (
        <tr
          key={p.id}
          className={`border-b border-line last:border-0 ${p.active ? '' : 'text-muted'}`}
        >
          <td className="px-3 py-2 font-semibold">
            {p.name}
            {!p.active && <span className="font-normal"> (موقوفة)</span>}
          </td>
          <td className="px-3 py-2">{p.durationHours} ساعة</td>
          <td className="px-3 py-2 tabular-nums">{formatSYP(p.price)}</td>
          <td className="px-3 py-1 text-end">
            <Button variant="quiet" onClick={() => onEdit(p.id)} aria-label={`تعديل ${p.name}`}>
              تعديل
            </Button>
          </td>
        </tr>
      ))}
    </Table>
  );
}
