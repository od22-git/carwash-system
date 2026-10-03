import type { CustomerRecord, TicketRecord, VehicleRecord } from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { useAction } from '../../../../shared/lib/use-action';
import { Field, Notice } from '../../../../shared/ui';
import { useCatalog } from '../../../catalog';
import { CarHeader } from '../../../customers';
import { useVehicleSubscription } from '../../../garage';
import { useActiveWorkers } from '../../../workers';
import { packageUse } from '../../lib/package-use';
import { priceWash } from '../../lib/price-wash';
import { createTicket } from '../../lib/ticket-actions';
import { busyWorkerIds, waitingCounts } from '../../lib/worker-load';
import { PackageWashChoice } from './PackageWashChoice';
import { ServicePicker } from './ServicePicker';
import { WashSubmitBar } from './WashSubmitBar';
import { WorkerPicker } from './WorkerPicker';

interface WashOptionsProps {
  customer: CustomerRecord;
  vehicle: VehicleRecord;
  openTickets: TicketRecord[];
  onCreated: (ticket: TicketRecord) => void;
  onChangeCar: () => void;
}

/** Services, worker and (if the car has a package) a free wash; then the car goes on the board. */
export function WashOptions({ customer, vehicle, openTickets, ...props }: WashOptionsProps) {
  const { services, matrix } = useCatalog();
  const workers = useActiveWorkers();
  const [openedAt] = useState(Date.now);
  const current = useVehicleSubscription(vehicle.id, openedAt) ?? null;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);
  const [useFreeWash, setUseFreeWash] = useState(true);
  const [notes, setNotes] = useState('');
  const action = useAction();

  const priced = priceWash([...selected], vehicle.size, services, matrix);
  const pkg = packageUse(current, priced.lines, useFreeWash);
  const busy = busyWorkerIds(openTickets);
  const workerBusy = workerId !== null && busy.has(workerId);
  const nameOf = (id: string) => services.find((s) => s.id === id)?.name ?? '';
  const toggle = (id: string) =>
    setSelected((s) => (s.has(id) ? new Set([...s].filter((x) => x !== id)) : new Set(s).add(id)));

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!workerId) return;
    const ticket = {
      customer,
      vehicle,
      lines: priced.lines,
      workerId,
      requestedWorker: requested,
      workerBusy,
      notes,
      packageUse: pkg,
    };
    await action.run(async () => props.onCreated(await createTicket(ticket)));
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <CarHeader vehicle={vehicle} customer={customer} onChangeCar={props.onChangeCar} />
      {openTickets.some((t) => t.vehicleId === vehicle.id) && (
        <Notice tone="error">
          هذه السيارة موجودة على اللوحة الآن. تأكد قبل تسجيلها مرة ثانية.
        </Notice>
      )}
      {current && (
        <PackageWashChoice
          current={current}
          coveredNames={current.subscription.washServiceIds.map(nameOf).filter(Boolean)}
          discount={pkg.packageDiscount}
          useFreeWash={useFreeWash}
          onUseFreeWash={setUseFreeWash}
        />
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
      <WashSubmitBar
        total={priced.total - pkg.packageDiscount}
        waits={workerBusy}
        disabled={action.busy || priced.lines.length === 0 || !workerId}
      />
    </form>
  );
}
