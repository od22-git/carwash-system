import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from './schema';

/** Inject with @Inject(DB). */
export const DB = Symbol('DB');
export const PG_POOL = Symbol('PG_POOL');

export type Database = NodePgDatabase<typeof schema>;
