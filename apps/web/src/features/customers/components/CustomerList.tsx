import { PlateChip } from '../../../shared/ui';
import type { CustomerMatch } from '../lib/search-customers';

interface CustomerListProps {
  matches: CustomerMatch[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CustomerList({ matches, selectedId, onSelect }: CustomerListProps) {
  return (
    <ul className="flex flex-col gap-2" aria-label="نتائج البحث">
      {matches.map(({ customer, vehicles }) => (
        <li key={customer.id}>
          <button
            type="button"
            onClick={() => onSelect(customer.id)}
            aria-current={selectedId === customer.id}
            className={`flex w-full flex-col items-start gap-2 rounded-lg border px-4 py-3 text-start ${
              selectedId === customer.id
                ? 'border-foam bg-foam/5'
                : 'border-line bg-surface hover:border-foam'
            }`}
          >
            <span className="flex w-full justify-between gap-2">
              <span className="font-semibold">{customer.name}</span>
              <span className="text-sm text-muted">{customer.code}</span>
            </span>
            {vehicles.length > 0 && (
              <span className="flex flex-wrap gap-1.5">
                {vehicles.map((v) => (
                  <PlateChip key={v.id} plate={v.plate} />
                ))}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
