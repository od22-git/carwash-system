import { formatSyrianPhone, type WorkerPublic } from '@carwash/shared';
import { Button } from '../../../shared/ui';
import { describePay } from '../lib/describe-pay';

interface WorkersTableProps {
  workers: WorkerPublic[];
  onEdit: (id: string) => void;
}

export function WorkersTable({ workers, onEdit }: WorkersTableProps) {
  return (
    <section
      aria-label="قائمة العمال"
      className="overflow-x-auto rounded-xl border border-line bg-surface"
    >
      <table className="w-full min-w-[36rem] border-collapse">
        <thead>
          <tr className="border-b border-line text-sm text-muted">
            <th scope="col" className="px-4 py-3 text-start font-semibold">
              العامل
            </th>
            <th scope="col" className="px-4 py-3 text-start font-semibold">
              الهاتف
            </th>
            <th scope="col" className="px-4 py-3 text-start font-semibold">
              الأجر
            </th>
            <th scope="col" className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {workers.map((w) => (
            <tr
              key={w.id}
              className={`border-b border-line last:border-0 ${w.active ? '' : 'text-muted'}`}
            >
              <td className="px-4 py-3 font-semibold">
                {w.name}
                {!w.active && <span className="font-normal"> (موقوف)</span>}
              </td>
              <td className="px-4 py-3" dir="ltr">
                <span className="block text-right">
                  {w.phone ? formatSyrianPhone(w.phone) : '—'}
                </span>
              </td>
              <td className="px-4 py-3">{describePay(w)}</td>
              <td className="px-4 py-3 text-end">
                <Button variant="quiet" onClick={() => onEdit(w.id)}>
                  تعديل
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
