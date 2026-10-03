import {
  DEFAULT_SERVICES,
  servicePriceId,
  toLatinDigits,
  type CarSize,
  type ServiceRecord,
} from '@carwash/shared';
import { db } from '../../../core/db';
import { deleteRecord, saveRecord } from '../../../core/sync';
import { nextSortOrder } from '../../../shared/lib/sort-order';

export async function addService(name: string, existing: ServiceRecord[]) {
  return saveRecord('services', {
    name: name.trim(),
    sortOrder: nextSortOrder(existing),
    active: true,
  });
}

/** Adds the nine services from the proposal, with no prices yet. */
export async function addDefaultServices() {
  for (const [index, name] of DEFAULT_SERVICES.entries()) {
    await saveRecord('services', { name, sortOrder: index + 1, active: true });
  }
}

export const renameService = (id: string, name: string) => saveRecord('services', { id, name });

/** A paused service stays in history but cannot be picked for new washes. */
export const setServiceActive = (id: string, active: boolean) =>
  saveRecord('services', { id, active });

/** "25,000" or "٢٥٠٠٠" -> 25000. Empty -> null (no price for this size). */
export function parsePrice(text: string): number | null {
  const digits = toLatinDigits(text).replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
}

/** Sets or clears the price of one service for one car size. */
export async function setPrice(serviceId: string, size: CarSize, price: number | null) {
  const id = servicePriceId(serviceId, size);
  if (price === null) {
    if (await db.servicePrices.get(id)) await deleteRecord('servicePrices', id);
    return;
  }
  await saveRecord('servicePrices', { id, serviceId, size, price, deletedAt: null });
}
