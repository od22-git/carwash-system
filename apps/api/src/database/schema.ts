/**
 * Every feature keeps its own tables in <feature>.schema.ts.
 * This file only gathers them for Drizzle and for migrations.
 */
export * from '../modules/audit/audit.schema';
export * from '../modules/catalog/catalog.schema';
export * from '../modules/customers/customers.schema';
export * from '../modules/devices/devices.schema';
export * from '../modules/garage/garage.schema';
export * from '../modules/settings/settings.schema';
export * from '../modules/subscriptions/subscriptions.schema';
export * from '../modules/sync/change-log.schema';
export * from '../modules/tickets/tickets.schema';
export * from '../modules/users/users.schema';
export * from '../modules/workers/workers.schema';
