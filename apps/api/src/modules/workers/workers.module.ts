import { Module } from '@nestjs/common';
import { registerSyncTables, SyncModule } from '../sync';
import { workersSync } from './workers.sync';

@Module({ imports: [SyncModule], providers: [registerSyncTables(workersSync)] })
export class WorkersModule {}
