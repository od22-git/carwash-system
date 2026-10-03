import { Module } from '@nestjs/common';
import { registerSyncTables, SyncModule } from '../sync';
import { parkingPlansSync, parkingSessionsSync } from './garage.sync';

@Module({
  imports: [SyncModule],
  providers: [registerSyncTables(parkingPlansSync, parkingSessionsSync)],
})
export class GarageModule {}
