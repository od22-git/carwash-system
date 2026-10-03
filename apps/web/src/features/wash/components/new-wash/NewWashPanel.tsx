import type { CustomerRecord, TicketRecord, VehicleRecord } from '@carwash/shared';
import { useState } from 'react';
import { Notice, RegisterPanel } from '../../../../shared/ui';
import { CarPicker } from '../../../customers';
import { PrintReceiptButton } from '../receipt/PrintReceiptButton';
import { WashOptions } from './WashOptions';

type Car = { vehicle: VehicleRecord; customer: CustomerRecord };

interface NewWashPanelProps {
  openTickets: TicketRecord[];
  onClose: () => void;
}

/** Register a car: plate (or a new car), then services and worker. */
export function NewWashPanel({ openTickets, onClose }: NewWashPanelProps) {
  const [car, setCar] = useState<Car | null>(null);
  const [created, setCreated] = useState<TicketRecord | null>(null);

  function done(ticket: TicketRecord) {
    setCreated(ticket);
    setCar(null);
  }

  return (
    <RegisterPanel title="تسجيل سيارة" onClose={onClose}>
      {created && (
        <div className="flex flex-wrap items-center gap-3">
          <Notice tone="success">
            سُجّلت السيارة {created.plate}، الإيصال {created.receiptNo}.
          </Notice>
          <PrintReceiptButton ticket={created} />
        </div>
      )}
      {car ? (
        <WashOptions
          {...car}
          openTickets={openTickets}
          onCreated={done}
          onChangeCar={() => setCar(null)}
        />
      ) : (
        <CarPicker onPick={(vehicle, customer) => setCar({ vehicle, customer })} />
      )}
    </RegisterPanel>
  );
}
