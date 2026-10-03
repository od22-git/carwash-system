import type { GarageSettings, SessionUser, SettingValue } from '@carwash/shared';
import { createContext, useContext } from 'react';

/** What every card on the wash screen needs, gathered once by the page. */
export interface WashContextValue {
  user: SessionUser;
  isAdmin: boolean;
  online: boolean;
  workerName: (workerId: string) => string;
  customerPhone: (customerId: string) => string | undefined;
  garage: GarageSettings;
  readyTemplate: string;
  receipt: SettingValue<'receipt'>;
}

export const WashContext = createContext<WashContextValue | null>(null);

export function useWash(): WashContextValue {
  const value = useContext(WashContext);
  if (!value) throw new Error('useWash must be used inside the wash page');
  return value;
}
