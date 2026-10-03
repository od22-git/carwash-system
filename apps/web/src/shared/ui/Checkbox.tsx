import { useId } from 'react';

interface CheckboxProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ label, hint, checked, onChange }: CheckboxProps) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-5 accent-foam"
      />
      <label htmlFor={id} className="flex flex-col gap-0.5">
        <span className="font-semibold">{label}</span>
        {hint && <span className="text-sm text-muted">{hint}</span>}
      </label>
    </div>
  );
}
