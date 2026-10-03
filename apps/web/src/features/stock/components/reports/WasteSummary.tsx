import { costPerCar, formatSYP, periodSummary } from '@carwash/shared';
import { useCarsWashed } from '../../hooks/use-cars-washed';
import { useStock } from '../../hooks/stock-context';

/** The period's waste cost, the cars washed, and the waste cost per car. */
export function WasteSummary({ from, to }: { from: number; to: number }) {
  const { products, ledger } = useStock();
  const cars = useCarsWashed(from, to);
  const cost = products.reduce(
    (sum, p) => sum + periodSummary(ledger.get(p.id) ?? [], from, to).countLossValue,
    0,
  );
  const perCar = costPerCar(cost, cars ?? 0);

  return (
    <dl className="flex flex-wrap gap-x-10 gap-y-2 rounded-xl border border-line bg-surface px-5 py-4">
      <Stat label="كلفة الهدر" value={formatSYP(cost)} />
      <Stat label="السيارات المغسولة" value={cars === undefined ? '…' : String(cars)} />
      <Stat label="كلفة الهدر لكل سيارة" value={perCar === null ? '—' : formatSYP(perCar)} />
    </dl>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-display text-xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}
