import type { ReactNode } from 'react';
import { Button } from './Button';

interface RegisterPanelProps {
  /** Also the region's accessible name. */
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** The framed step-by-step form that opens above a board (new wash, car into the garage, ...). */
export function RegisterPanel({ title, onClose, children }: RegisterPanelProps) {
  return (
    <section
      aria-label={title}
      className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-6"
    >
      <header className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <Button variant="secondary" onClick={onClose}>
          إغلاق
        </Button>
      </header>
      {children}
    </section>
  );
}
