import type { ZodIssue } from 'zod';

/** A save was refused because the data does not match the record's rules. */
export class InvalidRecordError extends Error {
  constructor(
    readonly table: string,
    readonly issues: ZodIssue[],
  ) {
    super(`Invalid ${table} record: ${issues.map((i) => i.path.join('.')).join(', ')}`);
  }
}
