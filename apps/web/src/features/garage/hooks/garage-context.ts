import type { GarageSettings, SessionUser, SettingValue } from '@carwash/shared';
import { createContext, useContext } from 'react';

/** What the garage screen's parts need, gathered once by the page. */
export interface GarageContextValue {
  user: SessionUser;
  isAdmin: boolean;
  garage: GarageSettings;
  receipt: SettingValue<'receipt'>;
}

export const GarageContext = createContext<GarageContextValue | null>(null);

export function useGarage(): GarageContextValue {
  const value = useContext(GarageContext);
  if (!value) throw new Error('useGarage must be used inside the garage page');
  return value;
}
