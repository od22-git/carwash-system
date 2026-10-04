import { costPerCar, formatSYP, periodSummary } from '@carwash/shared';
import { Stats } from '../../../../shared/ui';
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
    <Stats
      items={[
        { label: 'كلفة الهدر', value: formatSYP(cost) },
        { label: 'السيارات المغسولة', value: cars === undefined ? '…' : String(cars) },
        { label: 'كلفة الهدر لكل سيارة', value: perCar === null ? '—' : formatSYP(perCar) },
      ]}
    />
  );
}
