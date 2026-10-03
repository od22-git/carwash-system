import type { StockStatus } from '@carwash/shared';

const LOOK: Record<StockStatus | 'stopped', { label: string; className: string }> = {
  out: { label: 'نفد', className: 'bg-status-grace/10 text-status-grace' },
  low: { label: 'ناقص', className: 'bg-status-washing/10 text-status-washing' },
  ok: { label: 'متوفر', className: 'bg-status-done/10 text-status-done' },
  stopped: { label: 'متوقف', className: 'bg-ground text-muted' },
};

export function StatusBadge({ status, active }: { status: StockStatus; active: boolean }) {
  const look = LOOK[active ? status : 'stopped'];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${look.className}`}>
      {look.label}
    </span>
  );
}
