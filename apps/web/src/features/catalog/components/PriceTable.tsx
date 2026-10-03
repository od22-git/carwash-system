import { CAR_SIZES, CAR_SIZE_LABELS, type PriceMatrix, type ServiceRecord } from '@carwash/shared';
import { CommitInput } from '../../../shared/ui';
import { parsePrice, renameService, setPrice, setServiceActive } from '../lib/catalog-actions';

interface PriceTableProps {
  services: ServiceRecord[];
  matrix: PriceMatrix;
}

const formatPrice = (price: number | undefined) =>
  price === undefined ? '' : price.toLocaleString('en-US');

/** Services down, car sizes across. Every cell saves when the admin leaves it. */
export function PriceTable({ services, matrix }: PriceTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[44rem] border-collapse">
        <thead>
          <tr className="border-b border-line text-sm text-muted">
            <th scope="col" className="px-3 py-3 text-start font-semibold">
              الخدمة
            </th>
            {CAR_SIZES.map((size) => (
              <th key={size} scope="col" className="w-32 px-3 py-3 text-start font-semibold">
                {CAR_SIZE_LABELS[size]} (ل.س)
              </th>
            ))}
            <th scope="col" className="w-28 px-3 py-3 text-start font-semibold">
              الحالة
            </th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr
              key={service.id}
              className={`border-b border-line last:border-0 ${service.active ? '' : 'text-muted'}`}
            >
              <th scope="row" className="px-1 py-1 text-start font-normal">
                <CommitInput
                  aria-label="اسم الخدمة"
                  value={service.name}
                  onCommit={(name) => name && void renameService(service.id, name)}
                />
              </th>
              {CAR_SIZES.map((size) => (
                <td key={size} className="px-1 py-1">
                  <CommitInput
                    ltr
                    inputMode="numeric"
                    placeholder="—"
                    aria-label={`سعر ${service.name} لسيارة ${CAR_SIZE_LABELS[size]}`}
                    value={formatPrice(matrix[service.id]?.[size])}
                    onCommit={(text) => void setPrice(service.id, size, parsePrice(text))}
                  />
                </td>
              ))}
              <td className="px-3 py-1">
                <button
                  type="button"
                  className="text-sm text-foam-dark underline-offset-4 hover:underline"
                  onClick={() => void setServiceActive(service.id, !service.active)}
                >
                  {service.active ? 'إيقاف' : 'تفعيل'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
