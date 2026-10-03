import { productRecordSchema, saleRecordSchema, stockMovementRecordSchema } from '@carwash/shared';
import { receiptRules, type SyncEntry } from '../sync';
import { products, sales, stockMovements } from './stock.schema';

/** The admin manages products; the cashier needs names and selling prices to sell offline. */
export const productsSync: SyncEntry = {
  name: 'products',
  table: products,
  schema: productRecordSchema as unknown as SyncEntry['schema'],
  pushRoles: ['admin'],
  pullRoles: ['admin', 'user'],
};

/**
 * Purchases (with their costs), counts and damage. Only the admin's laptop has them,
 * so the cashier never sees purchase prices or how much is in stock.
 */
export const stockMovementsSync: SyncEntry = {
  name: 'stockMovements',
  table: stockMovements,
  schema: stockMovementRecordSchema as unknown as SyncEntry['schema'],
  pushRoles: ['admin'],
  pullRoles: ['admin'],
};

/** Both laptops sell; only the admin cancels, and a paid receipt is locked for the cashier. */
export const salesSync: SyncEntry = {
  name: 'sales',
  table: sales,
  schema: saleRecordSchema as unknown as SyncEntry['schema'],
  pushRoles: ['admin', 'user'],
  pullRoles: ['admin', 'user'],
  authorize: receiptRules(['paid', 'cancelled']),
};
