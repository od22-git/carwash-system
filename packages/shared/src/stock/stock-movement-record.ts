import { z } from 'zod';
import { syncRecordBase } from '../contracts/sync';

/** Sales are not movements: they live on the sale receipts and count as stock going out. */
export const MOVEMENT_TYPES = ['purchase', 'count', 'damage'] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  purchase: 'شراء',
  count: 'جرد',
  damage: 'تالف',
};

/**
 * One line of a product's stock ledger, written by the admin. Stock is never edited in
 * place, only added to, so the two laptops can never overwrite each other.
 */
export const stockMovementRecordSchema = syncRecordBase
  .extend({
    productId: z.string().min(1),
    type: z.enum(MOVEMENT_TYPES),
    /** Units in (+) or out (−). */
    qty: z.number().int(),
    /**
     * Money value of the change (SYP), same sign as qty: what a purchase cost,
     * what a loss was worth at the average cost.
     */
    value: z.number().int(),
    /** For a count: the units found on the shelf. */
    counted: z.number().int().nonnegative().nullable().default(null),
    /** When it happened (a purchase can be entered for an earlier day). */
    at: z.number().int(),
    supplier: z.string().trim().max(80).default(''),
    note: z.string().trim().max(200).default(''),
  })
  .superRefine((m, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: 'custom', message, path: ['qty'] });
    if (m.type === 'purchase' && (m.qty <= 0 || m.value < 0)) issue('A purchase adds stock');
    if (m.type === 'damage' && (m.qty >= 0 || m.value > 0)) issue('Damage removes stock');
    if (m.type === 'count' && m.counted === null) issue('A count needs the counted units');
  });
export type StockMovementRecord = z.infer<typeof stockMovementRecordSchema>;
