import { Module } from '@nestjs/common';
import { registerSyncTables, SyncModule } from '../sync';
import { servicePricesSync, servicesSync } from './catalog.sync';

@Module({ imports: [SyncModule], providers: [registerSyncTables(servicesSync, servicePricesSync)] })
export class CatalogModule {}
