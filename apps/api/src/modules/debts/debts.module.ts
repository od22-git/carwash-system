import { Module } from '@nestjs/common';
import { registerSyncTables, SyncModule } from '../sync';
import { debtPaymentsSync } from './debts.sync';

@Module({ imports: [SyncModule], providers: [registerSyncTables(debtPaymentsSync)] })
export class DebtsModule {}
