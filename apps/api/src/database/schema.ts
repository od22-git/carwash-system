/**
 * Every feature keeps its own tables in <feature>.schema.ts.
 * This file only gathers them for Drizzle and for migrations.
 */
export * from '../modules/devices/devices.schema';
export * from '../modules/settings/settings.schema';
export * from '../modules/sync/change-log.schema';
export * from '../modules/users/users.schema';
