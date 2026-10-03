import type { PackageRecord } from '@carwash/shared';
import { saveRecord } from '../../../core/sync';
import { parseWholeNumber } from '../../../shared/lib/parse-number';
import { nextSortOrder } from '../../../shared/lib/sort-order';

export interface PackageInput {
  name: string;
  /** Numbers as typed. */
  price: string;
  days: string;
  freeWashes: string;
  washServiceIds: string[];
  includesParking: boolean;
  active: boolean;
}

/** Adds a package (no id) or edits one. Packages already sold keep their own terms. */
export async function savePackage(input: PackageInput, existing: PackageRecord[], id?: string) {
  const freeWashes = parseWholeNumber(input.freeWashes || '0');
  const row = {
    id,
    name: input.name.trim(),
    price: parseWholeNumber(input.price),
    durationDays: parseWholeNumber(input.days),
    freeWashes,
    washServiceIds: freeWashes > 0 ? input.washServiceIds : [],
    includesParking: input.includesParking,
    active: input.active,
    ...(id ? {} : { sortOrder: nextSortOrder(existing) }),
  };
  return (await saveRecord('packages', row)) as PackageRecord;
}
