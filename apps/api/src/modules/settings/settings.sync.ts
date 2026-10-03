import { settingRecordSchema } from '@carwash/shared';
import type { SyncEntry } from '../sync';
import { settings } from './settings.schema';

/** Settings are read by every laptop (fees are calculated offline) and changed only by the admin. */
export const settingsSync: SyncEntry = {
  name: 'settings',
  table: settings,
  schema: settingRecordSchema as SyncEntry['schema'],
  pushRoles: ['admin'],
  pullRoles: ['admin', 'user'],
};
