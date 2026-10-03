import { Module } from '@nestjs/common';
import { registerSyncTables, SyncModule } from '../sync';
import { packagesSync, subscriptionsSync } from './subscriptions.sync';

@Module({
  imports: [SyncModule],
  providers: [registerSyncTables(packagesSync, subscriptionsSync)],
})
export class SubscriptionsModule {}
