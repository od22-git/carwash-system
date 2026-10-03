import { z } from 'zod';
import { syncRecordBase } from '../contracts/sync';
import { CAR_SIZES, type CarSize } from './car-size';
import type { PriceMatrix } from './wash-price';

/** A wash service the customer can pick (several can be combined on one car). */
export const serviceRecordSchema = syncRecordBase.extend({
  name: z.string().trim().min(2).max(60),
  sortOrder: z.number().int(),
  active: z.boolean(),
});
export type ServiceRecord = z.infer<typeof serviceRecordSchema>;

/** Price of one service for one car size. One row per (service, size). */
export const servicePriceRecordSchema = syncRecordBase.extend({
  serviceId: z.string().min(1),
  size: z.enum(CAR_SIZES),
  price: z.number().int().nonnegative(),
});
export type ServicePriceRecord = z.infer<typeof servicePriceRecordSchema>;

/**
 * Fixed id per (service, size), so both laptops edit the same row
 * and the newest price wins instead of creating duplicates.
 */
export const servicePriceId = (serviceId: string, size: CarSize) => `${serviceId}:${size}`;

export function buildPriceMatrix(
  prices: Pick<ServicePriceRecord, 'serviceId' | 'size' | 'price'>[],
) {
  const matrix: PriceMatrix = {};
  for (const p of prices) (matrix[p.serviceId] ??= {})[p.size] = p.price;
  return matrix;
}

/** The services from the proposal, offered as a starting list. */
export const DEFAULT_SERVICES = [
  'داخلي وخارجي معاً',
  'خارجي (ماء فقط)',
  'خارجي (ماء وشامبو)',
  'غسيل كامل مع محرك',
  'غسيل كامل مع باكاج (صندوق)',
  'غسيل كامل مع محرك وباكاج',
  'غسيل غرفة (شامل وكامل)',
  'غسيل محرك (موتور) منفصل',
  'غسيل سفلي للسيارة',
];
