import type { GarageSettings, ParkingPlanRecord } from '@carwash/shared';
import { HOURLY_CHOICE, planChoice } from '../../lib/parking-actions';
import { planPriceText } from '../../lib/describe';

export const HOURLY_ID = 'hourly';

interface PlanPickerProps {
  plans: ParkingPlanRecord[];
  settings: GarageSettings;
  /** "hourly" or a plan id. */
  value: string;
  onChange: (id: string) => void;
}

/** By the hour, or one of the admin's fixed plans (a day, two days, ...). */
export function PlanPicker({ plans, settings, value, onChange }: PlanPickerProps) {
  const options = [
    { id: HOURLY_ID, ...HOURLY_CHOICE },
    ...plans.map((p) => ({ id: p.id, ...planChoice(p) })),
  ];
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-semibold">طريقة الحساب</legend>
      {options.map((o) => (
        <label
          key={o.id}
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-line px-4 py-2.5 has-checked:border-foam has-checked:bg-foam/5"
        >
          <input
            type="radio"
            name="parking-plan"
            className="accent-foam"
            checked={value === o.id}
            onChange={() => onChange(o.id)}
          />
          <span className="font-semibold">{o.planName}</span>
          <span className="text-sm text-muted">{planPriceText(o.plan, settings)}</span>
        </label>
      ))}
    </fieldset>
  );
}
