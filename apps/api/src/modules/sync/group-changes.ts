import type { ChangeLogRow } from './change-log.schema';

/**
 * Groups a page of change-log lines into unique row ids per table,
 * keeping only tables the caller may read.
 */
export function groupChanges(
  changes: ChangeLogRow[],
  canRead: (table: string) => boolean,
): Map<string, string[]> {
  const byTable = new Map<string, Set<string>>();
  for (const change of changes) {
    if (!canRead(change.tableName)) continue;
    const ids = byTable.get(change.tableName) ?? new Set<string>();
    ids.add(change.rowId);
    byTable.set(change.tableName, ids);
  }
  return new Map([...byTable].map(([table, ids]) => [table, [...ids]]));
}
