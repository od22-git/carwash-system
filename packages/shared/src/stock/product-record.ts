import { z } from 'zod';
import { syncRecordBase } from '../contracts/sync';
import { isSellable, PRODUCT_KINDS } from './product-kind';

export const DEFAULT_UNIT = 'قطعة';

/** A product in one of the three stocks. Its cost comes from its purchases, not from here. */
export const productRecordSchema = syncRecordBase
  .extend({
    kind: z.enum(PRODUCT_KINDS),
    name: z.string().trim().min(2).max(80),
    /** What one unit is called: "قطعة", "لتر", "علبة". */
    unit: z.string().trim().min(1).max(20).default(DEFAULT_UNIT),
    unitsPerCarton: z.number().int().min(1).max(1000).default(1),
    /** The manufacturer's barcode, if it has one (scanned at the sales screen). */
    barcode: z.string().trim().max(40).default(''),
    /** Price of one unit (SYP). 0 = not sold by the piece. */
    retailPrice: z.number().int().nonnegative().default(0),
    /** Price of one full carton (SYP). 0 = not sold by the carton. */
    wholesalePrice: z.number().int().nonnegative().default(0),
    /** The admin is warned when the stock falls to this many units. */
    minQty: z.number().int().nonnegative().default(0),
    active: z.boolean().default(true),
  })
  .superRefine((p, ctx) => {
    const issue = (message: string, path: string) =>
      ctx.addIssue({ code: 'custom', message, path: [path] });
    if (!isSellable(p.kind)) {
      if (p.retailPrice > 0 || p.wholesalePrice > 0) {
        issue('Wash materials are never sold', 'retailPrice');
      }
      return;
    }
    if (p.retailPrice === 0 && p.wholesalePrice === 0) issue('Needs a price', 'retailPrice');
    if (p.wholesalePrice > 0 && p.unitsPerCarton < 2) {
      issue('A carton price needs units per carton', 'unitsPerCarton');
    }
  });
export type ProductRecord = z.infer<typeof productRecordSchema>;
