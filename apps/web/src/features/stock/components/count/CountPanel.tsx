import { formatSYP } from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { parseWholeNumber } from '../../../../shared/lib/parse-number';
import { useAction } from '../../../../shared/lib/use-action';
import { UserError } from '../../../../shared/lib/user-error';
import { Button, Notice, Table } from '../../../../shared/ui';
import { useStock } from '../../hooks/stock-context';
import { recordCount } from '../../lib/movement-actions';
import { CountRow } from './CountRow';

/**
 * The count: type what is really on the shelf. For wash materials (every evening), what is
 * missing is the day's waste; for products for sale, it is a loss. Empty rows are skipped.
 */
export function CountPanel({ wasteLabel }: { wasteLabel: string }) {
  const { rows } = useStock();
  const active = rows.filter((r) => r.product.active);
  const [values, setValues] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<string | null>(null);
  const action = useAction();

  async function submit(event: FormEvent) {
    event.preventDefault();
    const filled = active.filter(
      (r) => !Number.isNaN(parseWholeNumber(values[r.product.id] ?? '')),
    );
    const ok = await action.run(async () => {
      if (filled.length === 0) throw new UserError('اكتب العدد الموجود لصنف واحد على الأقل.');
      let lost = 0;
      for (const r of filled) {
        const counted = parseWholeNumber(values[r.product.id]!);
        lost -= (await recordCount(r.product, r.level, counted, r.unitCost)).value;
      }
      setSummary(`حُفظ جرد ${filled.length} صنف. ${wasteLabel}: ${formatSYP(Math.max(0, lost))}.`);
    });
    if (ok) setValues({});
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Table headers={['الصنف', 'المتوقع', 'العدد الآن', wasteLabel, 'القيمة']} minWidth="40rem">
        {active.map((row) => (
          <CountRow
            key={row.product.id}
            row={row}
            value={values[row.product.id] ?? ''}
            onChange={(v) => setValues({ ...values, [row.product.id]: v })}
          />
        ))}
      </Table>
      {action.error && <Notice tone="error">{action.error}</Notice>}
      {action.done && summary && <Notice tone="success">{summary}</Notice>}
      <Button type="submit" disabled={action.busy} className="self-start">
        حفظ الجرد
      </Button>
    </form>
  );
}
