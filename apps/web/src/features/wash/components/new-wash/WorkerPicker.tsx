import type { WorkerPublic } from '@carwash/shared';
import { Checkbox } from '../../../../shared/ui';

interface WorkerPickerProps {
  workers: WorkerPublic[];
  busy: Set<string>;
  waiting: Map<string, number>;
  workerId: string | null;
  onWorker: (id: string) => void;
  requested: boolean;
  onRequested: (requested: boolean) => void;
}

function workerState(id: string, busy: Set<string>, waiting: Map<string, number>) {
  if (!busy.has(id)) return 'متاح';
  const queue = waiting.get(id) ?? 0;
  return queue > 0 ? `مشغول، ${queue} بالانتظار` : 'مشغول بسيارة';
}

/** Every car has a worker. A busy worker means the car waits for them. */
export function WorkerPicker({
  workers,
  busy,
  waiting,
  workerId,
  onWorker,
  requested,
  onRequested,
}: WorkerPickerProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-sm font-semibold">العامل</legend>
      {workers.length === 0 && (
        <p className="text-muted">لا يوجد عمال. يضيفهم المسؤول من شاشة العمال.</p>
      )}
      <div className="flex flex-wrap gap-2">
        {workers.map((w) => (
          <label
            key={w.id}
            className={`flex cursor-pointer flex-col rounded-lg border px-4 py-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-foam ${
              workerId === w.id ? 'border-foam bg-foam/10' : 'border-line bg-surface'
            }`}
          >
            <input
              type="radio"
              name="worker"
              className="sr-only"
              checked={workerId === w.id}
              onChange={() => onWorker(w.id)}
            />
            <span className="font-semibold">{w.name}</span>
            <span
              className={`text-sm ${busy.has(w.id) ? 'text-status-washing' : 'text-status-done'}`}
            >
              {workerState(w.id, busy, waiting)}
            </span>
          </label>
        ))}
      </div>
      <Checkbox
        label="الزبون طلب هذا العامل"
        hint="إذا كان مشغولاً تبقى السيارة بانتظاره."
        checked={requested}
        onChange={onRequested}
      />
    </fieldset>
  );
}
