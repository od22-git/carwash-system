import { Module } from '@nestjs/common';
import { registerSyncTables, SyncModule } from '../sync';
import { settingsSync } from './settings.sync';

@Module({ imports: [SyncModule], providers: [registerSyncTables(settingsSync)] })
export class SettingsModule {}
