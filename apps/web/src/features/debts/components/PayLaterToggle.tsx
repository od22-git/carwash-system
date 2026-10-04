import { useId } from 'react';

interface PayLaterToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Next to a "deliver" button: the amount goes on the customer's account instead (آجل). */
export function PayLaterToggle({ checked, onChange }: PayLaterToggleProps) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-foam"
      />
      على الحساب (آجل)
    </label>
  );
}
