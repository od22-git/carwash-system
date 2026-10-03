import { z } from 'zod';
import { cancelFields } from '../contracts/record-fields';
import { syncRecordBase } from '../contracts/sync';
import { SELLABLE_KINDS } from './product-kind';

export const SALE_MODES = ['piece', 'carton'] as const;
export type SaleMode = (typeof SALE_MODES)[number];

export const SALE_MODE_LABELS: Record<SaleMode, string> = { piece: 'قطعة', carton: 'كرتونة' };

/** A product as it was sold (later price changes do not touch old receipts). */
export const saleLineSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(SELLABLE_KINDS),
  mode: z.enum(SALE_MODES),
  /** Pieces or cartons, as sold. */
  quantity: z.number().int().positive(),
  /** Units taken from stock (cartons × units per carton). */
  units: z.number().int().positive(),
  /** Price of one piece or one carton at the time of sale. */
  unitPrice: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});
export type SaleLine = z.infer<typeof saleLineSchema>;

export const SALE_STATUSES = ['paid', 'cancelled'] as const;
export type SaleStatus = (typeof SALE_STATUSES)[number];

/** A sale at the counter (car products and buffet), paid on the spot. */
export const saleRecordSchema = syncRecordBase
  .extend({
    receiptNo: z.string().min(3).max(20),
    lines: z.array(saleLineSchema).min(1).max(50),
    total: z.number().int().nonnegative(),
    status: z.enum(SALE_STATUSES),
    soldAt: z.number().int(),
    notes: z.string().max(300).default(''),
    ...cancelFields,
  })
  .refine((s) => s.total === s.lines.reduce((sum, l) => sum + l.total, 0), {
    message: 'Total must equal the sum of the lines',
    path: ['total'],
  });
export type SaleRecord = z.infer<typeof saleRecordSchema>;
