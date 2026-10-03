import { Module } from '@nestjs/common';
import { registerSyncTables, SyncModule } from '../sync';
import { productsSync, salesSync, stockMovementsSync } from './stock.sync';

@Module({
  imports: [SyncModule],
  providers: [registerSyncTables(productsSync, stockMovementsSync, salesSync)],
})
export class StockModule {}
