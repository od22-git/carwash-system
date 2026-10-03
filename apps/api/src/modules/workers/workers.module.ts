import { Module } from '@nestjs/common';
import { registerSyncTables, SyncModule } from '../sync';
import { workerPaymentsSync, workersSync } from './workers.sync';

@Module({ imports: [SyncModule], providers: [registerSyncTables(workersSync, workerPaymentsSync)] })
export class WorkersModule {}
