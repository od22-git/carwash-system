import { useOnline } from '../../core/network';

/**
 * Always visible, so the cashier knows work is safe even without internet.
 * The pending count is wired to the sync outbox in milestone 1.
 */
export function ConnectionStatus({ pending = 0 }: { pending?: number }) {
  const online = useOnline();
  const dot = online ? 'bg-status-done' : 'bg-status-grace';
  const text = online
    ? pending === 0
      ? 'متصل، كل العمليات محفوظة على الخادم'
      : `متصل، جارٍ رفع ${pending} عملية`
    : `بدون إنترنت، العمل يُحفظ على هذا الجهاز${pending ? ` (${pending} بانتظار الرفع)` : ''}`;

  return (
    <p role="status" className="flex items-center gap-2 text-sm text-muted">
      <span aria-hidden className={`size-2.5 rounded-full ${dot}`} />
      {text}
    </p>
  );
}
