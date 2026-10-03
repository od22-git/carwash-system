import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** A titled group on a page, e.g. one block of settings. */
export function Panel({ title, description, children }: PanelProps) {
  return (
    <section className="rounded-xl border border-line bg-surface p-6">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {description && <p className="mt-1 max-w-prose text-sm text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
