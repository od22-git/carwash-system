import { formatSyrianPhone, type CustomerRecord, type DuplicateHit } from '@carwash/shared';
import { Button } from '../../../shared/ui';

interface DuplicateHintProps {
  hits: DuplicateHit<CustomerRecord>[];
  onOpen: (customerId: string) => void;
}

/** Shown while typing a new customer, so the cashier picks the existing one instead. */
export function DuplicateHint({ hits, onOpen }: DuplicateHintProps) {
  if (hits.length === 0) return null;
  const samePhone = hits.some((h) => h.reason === 'same_phone');

  return (
    <div className="rounded-lg border border-status-washing/40 bg-status-washing/10 p-4">
      <p className="font-semibold text-status-washing">
        {samePhone
          ? 'رقم الهاتف هذا مسجّل لعميل موجود. افتح العميل بدل إنشاء عميل جديد.'
          : 'يوجد عملاء بأسماء مشابهة. تأكّد أنه ليس واحداً منهم.'}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {hits.map(({ customer }) => (
          <li key={customer.id} className="flex flex-wrap items-center justify-between gap-2">
            <span>
              <span className="font-semibold">{customer.name}</span>
              <span className="text-sm text-muted">
                {' ('}
                <bdi>{customer.code}</bdi>
                {'، '}
                <bdi dir="ltr">{formatSyrianPhone(customer.phone)}</bdi>
                {')'}
              </span>
            </span>
            <Button variant="secondary" onClick={() => onOpen(customer.id)}>
              فتح هذا العميل
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
