import { z } from 'zod';
import { CAR_SIZES } from '../catalog/car-size';
import { syncRecordBase } from '../contracts/sync';
import { SYRIAN_MOBILE } from './syrian-phone';

/**
 * A customer. Two customers may share a name; the code (made on the laptop, e.g. "A-0012")
 * and the phone tell them apart.
 */
export const customerRecordSchema = syncRecordBase.extend({
  code: z.string().min(3).max(20),
  name: z.string().trim().min(2).max(80),
  job: z.string().trim().max(60).default(''),
  /** Normalized, see normalizeSyrianPhone. */
  phone: z.string().regex(SYRIAN_MOBILE),
  notes: z.string().trim().max(300).default(''),
});
export type CustomerRecord = z.infer<typeof customerRecordSchema>;

/** A car. One customer can have several. */
export const vehicleRecordSchema = syncRecordBase.extend({
  customerId: z.string().min(1),
  /** Normalized, see normalizePlate. */
  plate: z.string().min(1).max(30),
  color: z.string().trim().max(30).default(''),
  size: z.enum(CAR_SIZES),
});
export type VehicleRecord = z.infer<typeof vehicleRecordSchema>;
