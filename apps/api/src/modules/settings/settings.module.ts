import { Module, type OnModuleInit } from '@nestjs/common';
import { settingRecordSchema } from '@carwash/shared';
import { SyncModule, SyncRegistry, type SyncEntry } from '../sync';
import { settings } from './settings.schema';

/** Settings are read by every laptop (fees are calculated offline) and changed only by the admin. */
const settingsSync: SyncEntry = {
  name: 'settings',
  table: settings,
  schema: settingRecordSchema as SyncEntry['schema'],
  pushRoles: ['admin'],
  pullRoles: ['admin', 'user'],
};

@Module({ imports: [SyncModule] })
export class SettingsModule implements OnModuleInit {
  constructor(private readonly registry: SyncRegistry) {}

  onModuleInit() {
    this.registry.register(settingsSync);
  }
}
