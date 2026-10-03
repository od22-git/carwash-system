import { useOnline } from '../../../core/network';
import { useSessionUser } from '../../../core/auth';
import { useCustomerDirectory } from '../../customers';
import { useSetting } from '../../settings';
import { useWorkers } from '../../workers';
import type { WashContextValue } from './wash-context';

/** Builds the wash context from the laptop database. Null until everything is loaded. */
export function useWashContextValue(): WashContextValue | null {
  const user = useSessionUser();
  const online = useOnline();
  const { workers, loading: workersLoading } = useWorkers();
  const { customers, loading: customersLoading } = useCustomerDirectory();
  const garage = useSetting('garage');
  const whatsapp = useSetting('whatsapp');
  const receipt = useSetting('receipt');

  if (!user || workersLoading || customersLoading || garage.loading) return null;

  const workerNames = new Map(workers.map((w) => [w.id, w.name]));
  const phones = new Map(customers.map((c) => [c.id, c.phone]));
  return {
    user,
    isAdmin: user.role === 'admin',
    online,
    workerName: (id) => workerNames.get(id) ?? '—',
    customerPhone: (id) => phones.get(id),
    garage: garage.value,
    readyTemplate: whatsapp.value.readyTemplate,
    receipt: receipt.value,
  };
}
