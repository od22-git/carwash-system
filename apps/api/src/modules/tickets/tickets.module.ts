import { Module } from '@nestjs/common';
import { registerSyncTables, SyncModule } from '../sync';
import { ticketsSync } from './tickets.sync';

@Module({ imports: [SyncModule], providers: [registerSyncTables(ticketsSync)] })
export class TicketsModule {}
