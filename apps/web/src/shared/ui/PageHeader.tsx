import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  /** Buttons shown at the end of the header (left side in RTL). */
  actions?: ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-display text-2xl font-bold text-balance">{title}</h1>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  );
}
