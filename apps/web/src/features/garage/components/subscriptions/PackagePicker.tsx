import { formatSYP, type PackageRecord } from '@carwash/shared';
import { termsText } from '../../lib/describe';

interface PackagePickerProps {
  packages: PackageRecord[];
  value: string | null;
  onChange: (id: string) => void;
}

export function PackagePicker({ packages, value, onChange }: PackagePickerProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-semibold">الباقة</legend>
      {packages.map((p) => (
        <label
          key={p.id}
          className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-line px-4 py-2.5 has-checked:border-foam has-checked:bg-foam/5"
        >
          <input
            type="radio"
            name="package"
            className="accent-foam"
            checked={value === p.id}
            onChange={() => onChange(p.id)}
          />
          <span className="font-semibold">{p.name}</span>
          <span className="text-sm text-muted">
            {p.durationDays} يوم، {termsText(p)}
          </span>
          <span className="ms-auto font-semibold tabular-nums">{formatSYP(p.price)}</span>
        </label>
      ))}
    </fieldset>
  );
}
