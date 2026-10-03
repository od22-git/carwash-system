import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db';
import { InvalidRecordError } from './invalid-record-error';
import { deleteRecord, saveRecord } from './save-record';
import { DEVICE, freshLaptop, garageDraft } from './test-helpers';

describe('saveRecord', () => {
  beforeEach(freshLaptop);

  it('saves on the laptop and queues the change', async () => {
    const row = await saveRecord('settings', garageDraft(1));
    expect(row).toMatchObject({ id: 'garage', deviceId: DEVICE.id, deletedAt: null });
    expect(await db.settings.get('garage')).toBeTruthy();
    expect(await db.outbox.count()).toBe(1);
  });

  it('keeps only the latest queued version of a row', async () => {
    await saveRecord('settings', garageDraft(1));
    await saveRecord('settings', garageDraft(2));
    const queued = await db.outbox.toArray();
    expect(queued).toHaveLength(1);
    expect(queued[0]!.row.value).toMatchObject({ hourlyRate: 2 });
  });

  it('always moves updatedAt forward and keeps createdAt', async () => {
    const first = await saveRecord('settings', garageDraft());
    const second = await saveRecord('settings', garageDraft());
    expect(second.updatedAt).toBeGreaterThan(first.updatedAt);
    expect(second.createdAt).toBe(first.createdAt);
  });

  it('deletes softly so the delete can sync', async () => {
    await saveRecord('settings', garageDraft());
    await deleteRecord('settings', 'garage');
    expect((await db.settings.get('garage'))?.deletedAt).toBeTypeOf('number');
  });

  it('brings a deleted row back with an explicit deletedAt: null', async () => {
    await saveRecord('settings', garageDraft());
    await deleteRecord('settings', 'garage');
    await saveRecord('settings', { ...garageDraft(), deletedAt: null });
    expect((await db.settings.get('garage'))?.deletedAt).toBeNull();
  });

  it('refuses data that breaks the rules, before it reaches the outbox', async () => {
    const bad = { id: 'garage', value: { hourlyRate: -1 } };
    await expect(saveRecord('settings', bad)).rejects.toBeInstanceOf(InvalidRecordError);
    expect(await db.outbox.count()).toBe(0);
  });

  it('refuses to save on an unregistered laptop', async () => {
    await db.meta.delete('device');
    await expect(saveRecord('settings', garageDraft())).rejects.toThrow();
  });
});
