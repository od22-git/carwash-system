import type { ServiceRecord } from '@carwash/shared';
import { Checkbox } from '../../../../shared/ui';

interface ServiceChecklistProps {
  services: ServiceRecord[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

/** Which services a free wash covers (others on the same visit are paid). */
export function ServiceChecklist({ services, selected, onChange }: ServiceChecklistProps) {
  const toggle = (id: string, on: boolean) =>
    onChange(on ? [...selected, id] : selected.filter((x) => x !== id));
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-semibold">الخدمات التي تشملها الغسلة المجانية</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {services.map((s) => (
          <Checkbox
            key={s.id}
            label={s.name}
            checked={selected.includes(s.id)}
            onChange={(on) => toggle(s.id, on)}
          />
        ))}
      </div>
    </fieldset>
  );
}
