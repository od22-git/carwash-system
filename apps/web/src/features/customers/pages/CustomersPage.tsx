import { useMemo, useState } from 'react';
import { Button, Field, PageHeader } from '../../../shared/ui';
import { CustomerDetails } from '../components/CustomerDetails';
import { CustomerForm } from '../components/CustomerForm';
import { CustomerList } from '../components/CustomerList';
import { useCustomerDirectory } from '../hooks/use-customer-directory';
import { searchCustomers } from '../lib/search-customers';

type View = { kind: 'none' } | { kind: 'new' } | { kind: 'customer'; id: string };

export function CustomersPage() {
  const { customers, vehicles, loading } = useCustomerDirectory();
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>({ kind: 'none' });
  const matches = useMemo(
    () => searchCustomers(query, customers, vehicles),
    [query, customers, vehicles],
  );

  const open = (id: string) => setView({ kind: 'customer', id });
  const selected = view.kind === 'customer' ? customers.find((c) => c.id === view.id) : undefined;

  return (
    <>
      <PageHeader
        title="العملاء"
        actions={<Button onClick={() => setView({ kind: 'new' })}>عميل جديد</Button>}
      />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <section className="flex flex-col gap-4">
          <Field
            label="بحث بالاسم أو الهاتف أو اللوحة أو رقم العميل"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {!loading && matches.length === 0 && (
            <p className="text-muted">
              {customers.length === 0 ? 'لا يوجد عملاء بعد.' : 'لا يوجد عميل مطابق.'}
            </p>
          )}
          <CustomerList matches={matches} selectedId={selected?.id ?? null} onSelect={open} />
        </section>

        {view.kind === 'new' && (
          <section className="rounded-xl border border-line bg-surface p-6">
            <h2 className="mb-5 font-display text-xl font-bold">عميل جديد</h2>
            <CustomerForm
              allCustomers={customers}
              onSaved={(c) => open(c.id)}
              onOpenCustomer={open}
              onCancel={() => setView({ kind: 'none' })}
            />
          </section>
        )}
        {selected && (
          <CustomerDetails
            key={selected.id}
            customer={selected}
            allCustomers={customers}
            allVehicles={vehicles}
            onOpenCustomer={open}
          />
        )}
        {view.kind === 'none' && (
          <p className="rounded-xl border border-dashed border-line p-6 text-muted">
            اختر عميلاً من القائمة لعرض بياناته وسياراته، أو أضف عميلاً جديداً.
          </p>
        )}
      </div>
    </>
  );
}
