import type { ReactNode } from 'react';

type Tone = 'info' | 'success' | 'warning' | 'error';

const TONES: Record<Tone, string> = {
  info: 'border-line bg-ground text-ink',
  success: 'border-status-done/40 bg-status-done/10 text-status-done',
  warning: 'border-status-washing/40 bg-status-washing/10 text-status-washing',
  error: 'border-status-grace/40 bg-status-grace/10 text-status-grace',
};

/** A short message under a form: what happened, and what to do next. */
export function Notice({ tone = 'info', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-4 py-3 text-sm ${TONES[tone]}`}
    >
      {children}
    </p>
  );
}
