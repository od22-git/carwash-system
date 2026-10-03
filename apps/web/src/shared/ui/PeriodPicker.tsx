import { useId } from 'react';
import { PERIOD_LABELS, type Period, type PeriodKind } from '../lib/period';
import { ChoiceGroup } from './ChoiceGroup';

const KINDS: PeriodKind[] = ['day', 'week', 'month'];

interface PeriodPickerProps {
  value: Period;
  onChange: (period: Period) => void;
}

/** Day, week or month, and a day inside it (the week or month around that day). */
export function PeriodPicker({ value, onChange }: PeriodPickerProps) {
  const id = useId();
  return (
    <div className="flex flex-wrap items-end gap-3">
      <ChoiceGroup
        legend="الفترة"
        hideLegend
        choices={KINDS.map((k) => ({ value: k, label: PERIOD_LABELS[k] }))}
        value={value.kind}
        onChange={(kind) => onChange({ ...value, kind })}
      />
      <label htmlFor={id} className="sr-only">
        تاريخ داخل الفترة
      </label>
      <input
        id={id}
        type="date"
        value={value.day}
        onChange={(e) => e.target.value && onChange({ ...value, day: e.target.value })}
        className="rounded-lg border border-line bg-surface px-3 py-2 focus:border-foam"
      />
    </div>
  );
}
