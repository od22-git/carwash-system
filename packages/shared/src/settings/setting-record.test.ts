import { describe, expect, it } from 'vitest';
import { SETTING_DEFAULTS, settingRecordSchema } from '.';

const base = { createdAt: 1, updatedAt: 1, deviceId: 'dev-1', deletedAt: null };

describe('settingRecordSchema', () => {
  it('accepts a valid garage setting', () => {
    const record = { ...base, id: 'garage', value: SETTING_DEFAULTS.garage };
    expect(settingRecordSchema.safeParse(record).success).toBe(true);
  });

  it('rejects a value that does not match its key', () => {
    const record = { ...base, id: 'garage', value: { hourlyRate: -5 } };
    expect(settingRecordSchema.safeParse(record).success).toBe(false);
  });

  it('rejects unknown setting keys', () => {
    const record = { ...base, id: 'colors', value: {} };
    expect(settingRecordSchema.safeParse(record).success).toBe(false);
  });
});
