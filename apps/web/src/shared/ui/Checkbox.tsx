import { useId } from 'react';

interface CheckboxProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** The hint is read as a description, so the checkbox's name stays just its label. */
export function Checkbox({ label, hint, checked, onChange }: CheckboxProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        aria-describedby={hint ? hintId : undefined}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-5 accent-foam"
      />
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="font-semibold">
          {label}
        </label>
        {hint && (
          <p id={hintId} className="text-sm text-muted">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
