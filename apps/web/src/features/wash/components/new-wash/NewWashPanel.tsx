import type { CustomerRecord, TicketRecord, VehicleRecord } from '@carwash/shared';
import { useState } from 'react';
import { Button, Notice } from '../../../../shared/ui';
import { useCustomerDirectory } from '../../../customers';
import { PrintReceiptButton } from '../receipt/PrintReceiptButton';
import { NewCarForm } from './NewCarForm';
import { PlateLookup } from './PlateLookup';
import { WashOptions } from './WashOptions';

type Step =
  | { kind: 'plate' }
  | { kind: 'new-car'; plate: string }
  | { kind: 'options'; vehicle: VehicleRecord; customer: CustomerRecord };

interface NewWashPanelProps {
  openTickets: TicketRecord[];
  onClose: () => void;
}

/** Register a car: plate -> (new car) -> services and worker. */
export function NewWashPanel({ openTickets, onClose }: NewWashPanelProps) {
  const { customers, vehicles } = useCustomerDirectory();
  const [step, setStep] = useState<Step>({ kind: 'plate' });
  const [created, setCreated] = useState<TicketRecord | null>(null);
  const toOptions = (vehicle: VehicleRecord, customer: CustomerRecord) =>
    setStep({ kind: 'options', vehicle, customer });

  function done(ticket: TicketRecord) {
    setCreated(ticket);
    setStep({ kind: 'plate' });
  }

  return (
    <section
      aria-label="تسجيل سيارة"
      className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-6"
    >
      <header className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">تسجيل سيارة</h2>
        <Button variant="secondary" onClick={onClose}>
          إغلاق
        </Button>
      </header>
      {created && (
        <div className="flex flex-wrap items-center gap-3">
          <Notice tone="success">
            سُجّلت السيارة {created.plate}، الإيصال {created.receiptNo}.
          </Notice>
          <PrintReceiptButton ticket={created} />
        </div>
      )}
      {step.kind === 'plate' && (
        <PlateLookup
          vehicles={vehicles}
          customers={customers}
          onPick={toOptions}
          onNewCar={(plate) => setStep({ kind: 'new-car', plate })}
        />
      )}
      {step.kind === 'new-car' && (
        <NewCarForm
          plate={step.plate}
          customers={customers}
          onReady={toOptions}
          onCancel={() => setStep({ kind: 'plate' })}
        />
      )}
      {step.kind === 'options' && (
        <WashOptions
          customer={step.customer}
          vehicle={step.vehicle}
          openTickets={openTickets}
          onCreated={done}
          onChangeCar={() => setStep({ kind: 'plate' })}
        />
      )}
    </section>
  );
}
