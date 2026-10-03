import { useId, type InputHTMLAttributes } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  /** Show numbers left-to-right even inside the RTL page (phones, usernames, amounts). */
  ltr?: boolean;
}

export function Field({ label, hint, ltr, className = '', ...input }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        dir={ltr ? 'ltr' : undefined}
        aria-describedby={hint ? hintId : undefined}
        className={`rounded-lg border border-line bg-surface px-3 py-2.5 focus:border-foam ${ltr ? 'text-right' : ''}`}
        {...input}
      />
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
