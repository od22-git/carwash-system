import { countResult, formatSYP } from '@carwash/shared';
import { parseWholeNumber } from '../../../../shared/lib/parse-number';
import type { StockRow } from '../../lib/stock-rows';

interface CountRowProps {
  row: StockRow;
  value: string;
  onChange: (value: string) => void;
}

/** One product: what the system expects, what is really there, and the difference. */
export function CountRow({ row, value, onChange }: CountRowProps) {
  const counted = parseWholeNumber(value);
  const result = Number.isNaN(counted) ? null : countResult(row.level, counted, row.unitCost);
  const { name, unit } = row.product;

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-3 py-2 font-semibold">{name}</td>
      <td className="px-3 py-2 tabular-nums">
        {row.level} {unit}
      </td>
      <td className="px-3 py-1.5">
        <input
          aria-label={`العدد الآن: ${name}`}
          dir="ltr"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 rounded-md border border-line bg-surface px-2 py-1.5 text-right focus:border-foam"
        />
      </td>
      <td className="px-3 py-2 tabular-nums">
        {result === null
          ? ''
          : result.aboveExpected
            ? `+${result.diff} (أكثر من المتوقع، تأكد)`
            : `${result.consumed} ${unit}`}
      </td>
      <td className="px-3 py-2 tabular-nums">
        {result && !result.aboveExpected ? formatSYP(-result.value) : ''}
      </td>
    </tr>
  );
}
