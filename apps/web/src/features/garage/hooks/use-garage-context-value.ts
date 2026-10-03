import { useSessionUser } from '../../../core/auth';
import { useSetting } from '../../settings';
import type { GarageContextValue } from './garage-context';

/** Builds the garage context. Null until the settings are loaded. */
export function useGarageContextValue(): GarageContextValue | null {
  const user = useSessionUser();
  const garage = useSetting('garage');
  const receipt = useSetting('receipt');
  if (!user || garage.loading || receipt.loading) return null;
  return { user, isAdmin: user.role === 'admin', garage: garage.value, receipt: receipt.value };
}
