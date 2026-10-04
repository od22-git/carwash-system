export interface StatItem {
  label: string;
  value: string;
  /** Colours the value (e.g. a loss in the net). */
  tone?: 'normal' | 'bad';
}

/** A row of key figures (income, expenses, net…) shown large above a report. */
export function Stats({ items }: { items: StatItem[] }) {
  return (
    <dl className="flex flex-wrap gap-x-10 gap-y-2 rounded-xl border border-line bg-surface px-5 py-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-sm text-muted">{item.label}</dt>
          <dd
            className={`font-display text-xl font-bold tabular-nums ${item.tone === 'bad' ? 'text-status-grace' : ''}`}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
