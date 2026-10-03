import { z } from 'zod';
import { syncRecordBase } from '../contracts/sync';
import { DEFAULT_GARAGE_SETTINGS, garageSettingsSchema } from '../garage';
import { DEFAULT_READY_TEMPLATE } from '../whatsapp';

/** Settings are synced records whose id is the setting key. */
export const settingValueSchemas = {
  garage: garageSettingsSchema,
  receipt: z.object({ shopName: z.string().max(80), footer: z.string().max(200) }),
  whatsapp: z.object({ readyTemplate: z.string().min(1).max(500) }),
} as const;

export type SettingKey = keyof typeof settingValueSchemas;
export type SettingValue<K extends SettingKey> = z.infer<(typeof settingValueSchemas)[K]>;

export const SETTING_DEFAULTS: { [K in SettingKey]: SettingValue<K> } = {
  garage: DEFAULT_GARAGE_SETTINGS,
  receipt: { shopName: 'المغسلة', footer: 'شكراً لزيارتكم، نتمنى لكم طريقاً آمناً' },
  whatsapp: { readyTemplate: DEFAULT_READY_TEMPLATE },
};

export const settingRecordSchema = syncRecordBase
  .extend({ id: z.enum(['garage', 'receipt', 'whatsapp']), value: z.unknown() })
  .superRefine((record, ctx) => {
    const result = settingValueSchemas[record.id].safeParse(record.value);
    if (!result.success) ctx.addIssue({ code: 'custom', message: result.error.message });
  });
export type SettingRecord = z.infer<typeof settingRecordSchema>;
