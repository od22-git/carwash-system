import { formatSYP, type PackageRecord } from '@carwash/shared';
import { Button, Table } from '../../../../shared/ui';
import { termsText } from '../../lib/describe';

interface PackagesTableProps {
  packages: PackageRecord[];
  onEdit: (id: string) => void;
}

export function PackagesTable({ packages, onEdit }: PackagesTableProps) {
  return (
    <Table headers={['الباقة', 'المدة', 'تشمل', 'السعر', '']} minWidth="40rem">
      {packages.map((p) => (
        <tr
          key={p.id}
          className={`border-b border-line last:border-0 ${p.active ? '' : 'text-muted'}`}
        >
          <td className="px-3 py-2 font-semibold">
            {p.name}
            {!p.active && <span className="font-normal"> (موقوفة)</span>}
          </td>
          <td className="px-3 py-2">{p.durationDays} يوم</td>
          <td className="px-3 py-2">{termsText(p)}</td>
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
