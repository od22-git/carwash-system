import { Module } from '@nestjs/common';
import { registerSyncTables, SyncModule } from '../sync';
import { budgetsSync, expensesSync } from './finance.sync';

@Module({ imports: [SyncModule], providers: [registerSyncTables(expensesSync, budgetsSync)] })
export class FinanceModule {}
