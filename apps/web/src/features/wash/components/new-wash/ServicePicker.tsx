import { formatSYP, type CarSize, type PriceMatrix, type ServiceRecord } from '@carwash/shared';

interface ServicePickerProps {
  services: ServiceRecord[];
  matrix: PriceMatrix;
  size: CarSize;
  selected: Set<string>;
  onToggle: (serviceId: string) => void;
}

/** Any combination of services (e.g. underbody + exterior), priced for this car's size. */
export function ServicePicker({ services, matrix, size, selected, onToggle }: ServicePickerProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">الخدمات</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {services.map((service) => {
          const price = matrix[service.id]?.[size];
          const checked = selected.has(service.id);
          return (
            <label
              key={service.id}
              className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${
                price === undefined
                  ? 'cursor-not-allowed border-line text-muted'
                  : checked
                    ? 'cursor-pointer border-foam bg-foam/10'
                    : 'cursor-pointer border-line bg-surface hover:border-foam'
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4 accent-foam"
                  disabled={price === undefined}
                  checked={checked}
                  onChange={() => onToggle(service.id)}
                />
                {service.name}
              </span>
              <span className="text-sm tabular-nums">
                {price === undefined ? 'غير متاح لهذا الحجم' : formatSYP(price)}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
