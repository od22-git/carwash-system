import { useSyncStatus, type SyncStatus } from '../../core/sync';

const DOT: Record<SyncStatus['phase'], string> = {
  idle: 'bg-status-done',
  syncing: 'bg-status-washing',
  offline: 'bg-status-grace',
  'login-expired': 'bg-status-grace',
  error: 'bg-status-grace',
};

function describe({ phase, pending }: SyncStatus): string {
  const waiting = pending > 0 ? ` (${pending} بانتظار الرفع)` : '';
  switch (phase) {
    case 'syncing':
      return 'جارٍ المزامنة مع الخادم…';
    case 'offline':
      return `بدون إنترنت، العمل يُحفظ على هذا الجهاز${waiting}`;
    case 'login-expired':
      return `انتهت الجلسة، سجّل الخروج ثم الدخول مع الإنترنت لرفع العمل${waiting}`;
    case 'error':
      return `تعذّرت المزامنة، ستُعاد المحاولة تلقائياً${waiting}`;
    case 'idle':
      return pending === 0 ? 'متصل، كل العمليات محفوظة على الخادم' : `متصل${waiting}`;
  }
}

/** Always visible, so the cashier knows work is safe even without internet. */
export function ConnectionStatus() {
  const status = useSyncStatus();
  return (
    <p role="status" className="flex items-center gap-2 text-sm text-muted">
      <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${DOT[status.phase]}`} />
      {describe(status)}
    </p>
  );
}
