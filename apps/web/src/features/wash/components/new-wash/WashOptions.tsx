import {
  CAR_SIZE_LABELS,
  formatSYP,
  type CustomerRecord,
  type TicketRecord,
  type VehicleRecord,
} from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { useAction } from '../../../../shared/lib/use-action';
import { Button, Field, Notice, PlateChip } from '../../../../shared/ui';
import { useCatalog } from '../../../catalog';
import { useActiveWorkers } from '../../../workers';
import { priceWash } from '../../lib/price-wash';
import { createTicket } from '../../lib/ticket-actions';
import { busyWorkerIds, waitingCounts } from '../../lib/worker-load';
import { ServicePicker } from './ServicePicker';
import { WorkerPicker } from './WorkerPicker';

interface WashOptionsProps {
  customer: CustomerRecord;
  vehicle: VehicleRecord;
  openTickets: TicketRecord[];
  onCreated: (ticket: TicketRecord) => void;
  onChangeCar: () => void;
}

/** Step 2: services and worker, then the car goes on the board. */
export function WashOptions({
  customer,
  vehicle,
  openTickets,
  onCreated,
  onChangeCar,
}: WashOptionsProps) {
  const { services, matrix } = useCatalog();
  const workers = useActiveWorkers();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);
  const [notes, setNotes] = useState('');
  const action = useAction();

  const priced = priceWash([...selected], vehicle.size, services, matrix);
  const busy = busyWorkerIds(openTickets);
  const workerBusy = workerId !== null && busy.has(workerId);
  const alreadyOnBoard = openTickets.some((t) => t.vehicleId === vehicle.id);
  const toggle = (id: string) =>
    setSelected((s) => (s.has(id) ? new Set([...s].filter((x) => x !== id)) : new Set(s).add(id)));

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!workerId) return;
    const input = {
      customer,
      vehicle,
      lines: priced.lines,
      workerId,
      requestedWorker: requested,
      workerBusy,
      notes,
    };
    await action.run(async () => onCreated(await createTicket(input)));
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <PlateChip plate={vehicle.plate} size="lg" />
        <span className="font-semibold">{customer.name}</span>
        <span className="text-muted">{CAR_SIZE_LABELS[vehicle.size]}</span>
        <Button variant="quiet" onClick={onChangeCar}>
          تغيير السيارة
        </Button>
      </div>
      {alreadyOnBoard && (
        <Notice tone="error">
          هذه السيارة موجودة على اللوحة الآن. تأكد قبل تسجيلها مرة ثانية.
        </Notice>
      )}
      <ServicePicker
        services={services.filter((s) => s.active)}
        matrix={matrix}
        size={vehicle.size}
        selected={selected}
        onToggle={toggle}
      />
      <WorkerPicker
        workers={workers}
        busy={busy}
        waiting={waitingCounts(openTickets)}
        workerId={workerId}
        onWorker={setWorkerId}
        requested={requested}
        onRequested={setRequested}
      />
      <Field label="ملاحظات (اختياري)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      {action.error && <Notice tone="error">{action.error}</Notice>}
      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-4">
        <p className="font-display text-xl font-bold">المجموع: {formatSYP(priced.total)}</p>
        <Button type="submit" disabled={action.busy || priced.lines.length === 0 || !workerId}>
          {workerBusy ? 'تسجيل (بانتظار العامل)' : 'بدء الغسيل'}
        </Button>
      </div>
    </form>
  );
}
