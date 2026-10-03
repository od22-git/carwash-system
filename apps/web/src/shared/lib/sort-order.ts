/** Puts a new row after the existing ones. */
export const nextSortOrder = (rows: { sortOrder: number }[]) =>
  Math.max(0, ...rows.map((r) => r.sortOrder)) + 1;
