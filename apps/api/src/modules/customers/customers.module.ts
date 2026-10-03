import { Module } from '@nestjs/common';
import { registerSyncTables, SyncModule } from '../sync';
import { customersSync, vehiclesSync } from './customers.sync';

@Module({ imports: [SyncModule], providers: [registerSyncTables(customersSync, vehiclesSync)] })
export class CustomersModule {}
