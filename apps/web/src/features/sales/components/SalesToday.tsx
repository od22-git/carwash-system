import { formatSYP, type SessionUser } from '@carwash/shared';
import { Table } from '../../../shared/ui';
import { useSalesSince } from '../hooks/use-sales-data';
import { SALE_HEADERS, SaleRow } from './SaleRow';

/** Today's counter sales from both laptops, with the day's income. */
export function SalesToday({ today, user }: { today: number; user: SessionUser }) {
  const sales = useSalesSince(today) ?? [];
  const income = sales.filter((s) => s.status !== 'cancelled').reduce((sum, s) => sum + s.total, 0);

  return (
    <section aria-label="مبيعات اليوم" className="flex flex-col gap-3">
      <h2 className="flex flex-wrap items-baseline gap-3 font-display text-lg font-bold">
        مبيعات اليوم
        <span className="font-body text-base font-normal text-muted">
          {sales.length} إيصال، الدخل {formatSYP(income)}
        </span>
      </h2>
      {sales.length > 0 && (
        <Table headers={SALE_HEADERS} minWidth="40rem">
          {sales.map((sale) => (
            <SaleRow key={sale.id} sale={sale} user={user} />
          ))}
        </Table>
      )}
    </section>
  );
}
