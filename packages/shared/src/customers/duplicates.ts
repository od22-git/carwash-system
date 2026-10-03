import { editDistance, normalizeArabicName } from './arabic-name';
import { normalizeSyrianPhone } from './syrian-phone';

export interface CustomerLike {
  id: string;
  name: string;
  phone: string;
}

export interface DuplicateHit<T extends CustomerLike> {
  customer: T;
  reason: 'same_phone' | 'similar_name';
}

const MIN_FUZZY_LENGTH = 4;

function namesLookAlike(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length < MIN_FUZZY_LENGTH) return false;
  return a.includes(b) || b.includes(a) || editDistance(a, b) <= 1;
}

/**
 * Shown before saving a new customer, so the employee can pick the existing one instead.
 * Same phone = almost surely the same person. Similar name = maybe (two people can share a name).
 */
export function findPossibleDuplicates<T extends CustomerLike>(
  input: { name: string; phone: string },
  existing: T[],
): DuplicateHit<T>[] {
  const phone = normalizeSyrianPhone(input.phone);
  const name = normalizeArabicName(input.name);
  const samePhone: DuplicateHit<T>[] = [];
  const similarName: DuplicateHit<T>[] = [];

  for (const customer of existing) {
    if (phone && normalizeSyrianPhone(customer.phone) === phone) {
      samePhone.push({ customer, reason: 'same_phone' });
    } else if (namesLookAlike(name, normalizeArabicName(customer.name))) {
      similarName.push({ customer, reason: 'similar_name' });
    }
  }
  return [...samePhone, ...similarName];
}
