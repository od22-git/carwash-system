import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db';
import { deleteRecord, saveRecord } from './save-record';
import { DEVICE, freshLaptop } from './test-helpers';

describe('saveRecord', () => {
  beforeEach(freshLaptop);

  it('saves on the laptop and queues the change', async () => {
    const row = await saveRecord('settings', { id: 'garage', value: { hourlyRate: 1 } });
    expect(row).toMatchObject({ id: 'garage', deviceId: DEVICE.id, deletedAt: null });
    expect(await db.settings.get('garage')).toBeTruthy();
    expect(await db.outbox.count()).toBe(1);
  });

  it('keeps only the latest queued version of a row', async () => {
    await saveRecord('settings', { id: 'garage', value: { hourlyRate: 1 } });
    await saveRecord('settings', { id: 'garage', value: { hourlyRate: 2 } });
    const queued = await db.outbox.toArray();
    expect(queued).toHaveLength(1);
    expect(queued[0]!.row.value).toEqual({ hourlyRate: 2 });
  });

  it('always moves updatedAt forward and keeps createdAt', async () => {
    const first = await saveRecord('settings', { id: 'garage', value: {} });
    const second = await saveRecord('settings', { id: 'garage', value: {} });
    expect(second.updatedAt).toBeGreaterThan(first.updatedAt);
    expect(second.createdAt).toBe(first.createdAt);
  });

  it('deletes softly so the delete can sync', async () => {
    await saveRecord('settings', { id: 'garage', value: {} });
    await deleteRecord('settings', 'garage');
    expect((await db.settings.get('garage'))?.deletedAt).toBeTypeOf('number');
  });

  it('refuses to save on an unregistered laptop', async () => {
    await db.meta.delete('device');
    await expect(saveRecord('settings', { id: 'garage', value: {} })).rejects.toThrow();
  });
});
