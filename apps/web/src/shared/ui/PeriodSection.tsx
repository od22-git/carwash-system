import { useId, type ReactNode } from 'react';

interface PeriodSectionProps {
  title: string;
  /** "month" picks 2026-10, "date" picks 2026-10-04. */
  type: 'month' | 'date';
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

/** A report section with its own day or month picker. */
export function PeriodSection({ title, type, value, onChange, children }: PeriodSectionProps) {
  const id = useId();
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          <label htmlFor={id} className="text-sm font-semibold">
            {type === 'month' ? 'الشهر' : 'اليوم'}
          </label>
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => e.target.value && onChange(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 focus:border-foam"
          />
        </div>
      </div>
      {children}
    </section>
  );
}
