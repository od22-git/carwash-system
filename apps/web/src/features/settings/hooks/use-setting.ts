import {
  SETTING_DEFAULTS,
  settingValueSchemas,
  type SettingKey,
  type SettingValue,
} from '@carwash/shared';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../core/db';
import { saveRecord } from '../../../core/sync';

export interface LoadedSetting<K extends SettingKey> {
  value: SettingValue<K>;
  /** Changes when the setting is saved here or arrives from the other laptop. */
  version: number;
  loading: boolean;
}

/** Current value of a setting, falling back to the default until the admin saves one. */
export function useSetting<K extends SettingKey>(key: K): LoadedSetting<K> {
  const record = useLiveQuery(async () => (await db.settings.get(key)) ?? null, [key]);
  const parsed = settingValueSchemas[key].safeParse(record?.value);
  return {
    value: (parsed.success ? parsed.data : SETTING_DEFAULTS[key]) as SettingValue<K>,
    version: record?.updatedAt ?? 0,
    loading: record === undefined,
  };
}

export function saveSetting<K extends SettingKey>(key: K, value: SettingValue<K>) {
  return saveRecord('settings', { id: key, value });
}
