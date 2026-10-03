import type { DeviceInfo, Role } from '@carwash/shared';
import { api } from '../api';
import { getMeta, setMeta } from '../db';

const DEFAULT_NAMES: Record<Role, string> = {
  admin: 'لابتوب المسؤول',
  user: 'لابتوب الاستقبال',
};

/** Registers this laptop once (first online login) and keeps its receipt prefix. */
export async function ensureDeviceRegistered(role: Role): Promise<DeviceInfo> {
  const existing = await getMeta('device');
  if (existing) return existing;
  const device = await api<DeviceInfo>('/devices', {
    method: 'POST',
    body: { name: DEFAULT_NAMES[role] },
  });
  await setMeta('device', device);
  return device;
}
