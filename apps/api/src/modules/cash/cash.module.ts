import { Module } from '@nestjs/common';
import { registerSyncTables, SyncModule } from '../sync';
import { cashClosesSync } from './cash.sync';

@Module({ imports: [SyncModule], providers: [registerSyncTables(cashClosesSync)] })
export class CashModule {}
