import { CAR_SIZES, CAR_SIZE_LABELS, type CarSize } from '@carwash/shared';
import { useId } from 'react';

interface CarSizePickerProps {
  value: CarSize | null;
  onChange: (size: CarSize) => void;
}

/** The car size decides the price, so it is a clear one-tap choice. */
export function CarSizePicker({ value, onChange }: CarSizePickerProps) {
  const name = useId();
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold">حجم السيارة</legend>
      <div className="flex flex-wrap gap-2">
        {CAR_SIZES.map((size) => (
          <label
            key={size}
            className={`cursor-pointer rounded-lg border px-4 py-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-foam ${
              value === size
                ? 'border-foam bg-foam/10 font-semibold text-foam-dark'
                : 'border-line bg-surface'
            }`}
          >
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={value === size}
              onChange={() => onChange(size)}
            />
            {CAR_SIZE_LABELS[size]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
