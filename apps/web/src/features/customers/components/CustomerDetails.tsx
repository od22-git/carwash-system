import { formatSyrianPhone, type CustomerRecord, type VehicleRecord } from '@carwash/shared';
import { useState } from 'react';
import { Button } from '../../../shared/ui';
import { DebtPanel } from '../../debts';
import { CustomerForm } from './CustomerForm';
import { CustomerVehicles } from './CustomerVehicles';

interface CustomerDetailsProps {
  customer: CustomerRecord;
  allCustomers: CustomerRecord[];
  allVehicles: VehicleRecord[];
  onOpenCustomer: (id: string) => void;
}

export function CustomerDetails({
  customer,
  allCustomers,
  allVehicles,
  onOpenCustomer,
}: CustomerDetailsProps) {
  const [editing, setEditing] = useState(false);
  const vehicles = allVehicles.filter((v) => v.customerId === customer.id);
  const customerName = (id: string) => allCustomers.find((c) => c.id === id)?.name ?? '';

  return (
    <article className="flex flex-col gap-6 rounded-xl border border-line bg-surface p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">{customer.name}</h2>
          <p className="text-sm text-muted">رقم العميل {customer.code}</p>
        </div>
        {!editing && (
          <Button variant="secondary" onClick={() => setEditing(true)}>
            تعديل البيانات
          </Button>
        )}
      </header>

      {editing ? (
        <CustomerForm
          customer={customer}
          allCustomers={allCustomers}
          onSaved={() => setEditing(false)}
          onOpenCustomer={onOpenCustomer}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          <Info label="الهاتف" value={formatSyrianPhone(customer.phone)} ltr />
          <Info label="المهنة" value={customer.job} />
          <Info label="ملاحظات" value={customer.notes} />
        </dl>
      )}

      <CustomerVehicles
        customerId={customer.id}
        vehicles={vehicles}
        allVehicles={allVehicles}
        customerName={customerName}
      />
      <DebtPanel key={customer.id} customer={customer} />
    </article>
  );
}

function Info({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd dir={ltr ? 'ltr' : undefined} className={ltr ? 'text-right' : undefined}>
        {value || '—'}
      </dd>
    </div>
  );
}
