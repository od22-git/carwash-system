import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db';
import { applyChanges } from './apply-changes';
import { saveRecord } from './save-record';
import { freshLaptop } from './test-helpers';

const serverRow = (updatedAt: number, hourlyRate: number) => ({
  id: 'garage',
  createdAt: 1,
  updatedAt,
  deviceId: 'other-laptop',
  deletedAt: null,
  value: { hourlyRate },
});

describe('applyChanges', () => {
  beforeEach(freshLaptop);

  it('saves rows from the server', async () => {
    await applyChanges([{ table: 'settings', rows: [serverRow(10, 3)] }]);
    expect((await db.settings.get('garage'))?.value).toEqual({ hourlyRate: 3 });
  });

  it('keeps a newer change this laptop has not sent yet', async () => {
    const local = await saveRecord('settings', { id: 'garage', value: { hourlyRate: 7 } });
    await applyChanges([{ table: 'settings', rows: [serverRow(local.updatedAt - 5, 1)] }]);
    expect((await db.settings.get('garage'))?.value).toEqual({ hourlyRate: 7 });
  });

  it('takes the server row when it is newer than the unsent local change', async () => {
    const local = await saveRecord('settings', { id: 'garage', value: { hourlyRate: 7 } });
    await applyChanges([{ table: 'settings', rows: [serverRow(local.updatedAt + 5, 9)] }]);
    expect((await db.settings.get('garage'))?.value).toEqual({ hourlyRate: 9 });
  });

  it('ignores tables this app version does not know', async () => {
    await expect(
      applyChanges([{ table: 'future_table', rows: [serverRow(1, 1)] }]),
    ).resolves.toBeUndefined();
  });
});
