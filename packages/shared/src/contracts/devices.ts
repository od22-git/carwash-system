import { z } from 'zod';

export const registerDeviceSchema = z.object({ name: z.string().trim().min(2).max(60) });
export type RegisterDeviceRequest = z.infer<typeof registerDeviceSchema>;

export interface DeviceInfo {
  id: string;
  name: string;
  /** Receipt number prefix for this laptop, e.g. "A" -> A-000123. */
  prefix: string;
}

/** Header every laptop sends so the server knows which device a change came from. */
export const DEVICE_HEADER = 'x-device-id';
