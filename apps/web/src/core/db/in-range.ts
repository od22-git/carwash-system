import type { Table } from 'dexie';

/** Rows whose indexed time is in [from, to), e.g. tickets delivered this month. */
export const inRange = <T, I>(
  table: Table<T, string, I>,
  index: string,
  [from, to]: [number, number],
) => table.where(index).between(from, to, true, false).toArray();
