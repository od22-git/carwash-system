import { useEffect, useState, type InputHTMLAttributes } from 'react';

interface CommitInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  value: string;
  /** Called on blur or Enter, only when the text changed. */
  onCommit: (value: string) => void;
  ltr?: boolean;
}

/** An input inside a table that saves when the cashier leaves it, without a Save button. */
export function CommitInput({ value, onCommit, ltr, className = '', ...rest }: CommitInputProps) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    if (draft.trim() !== value.trim()) onCommit(draft.trim());
  };

  return (
    <input
      value={draft}
      dir={ltr ? 'ltr' : undefined}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      className={`w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 hover:border-line focus:border-foam focus:bg-surface ${ltr ? 'text-right' : ''} ${className}`}
      {...rest}
    />
  );
}
