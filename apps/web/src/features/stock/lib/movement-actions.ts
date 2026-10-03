import {
  countResult,
  formatSYP,
  MOVEMENT_TYPE_LABELS,
  type ProductRecord,
  type SessionUser,
  type StockMovementRecord,
} from '@carwash/shared';
import { logAudit } from '../../../core/audit';
import { deleteRecord, saveRecord } from '../../../core/sync';

const save = async (row: Record<string, unknown>) =>
  (await saveRecord('stockMovements', row)) as StockMovementRecord;

export type PurchaseMode = 'carton' | 'piece';

export interface PurchaseInput {
  product: ProductRecord;
  mode: PurchaseMode;
  /** Cartons or pieces bought. */
  quantity: number;
  /** Price paid for one carton or one piece. */
  price: number;
  at: number;
  supplier: string;
  note: string;
}

export const purchaseUnits = (product: ProductRecord, mode: PurchaseMode, quantity: number) =>
  mode === 'carton' ? quantity * product.unitsPerCarton : quantity;

/** Stock arrives (by the carton or by the piece); its cost sets the average cost. */
export function recordPurchase(input: PurchaseInput) {
  return save({
    productId: input.product.id,
    type: 'purchase',
    qty: purchaseUnits(input.product, input.mode, input.quantity),
    value: input.price * input.quantity,
    at: input.at,
    supplier: input.supplier.trim(),
    note: input.note.trim(),
  });
}

/** Units broken, expired or lost, valued at the average cost. */
export function recordDamage(
  product: ProductRecord,
  units: number,
  unitCost: number,
  note: string,
) {
  return save({
    productId: product.id,
    type: 'damage',
    qty: -units,
    value: -Math.round(units * unitCost),
    at: Date.now(),
    note: note.trim(),
  });
}

/**
 * A count (the evening count of wash materials, or a stock check): the shelf becomes the
 * counted units, and what is missing is recorded (the waste, for wash materials).
 */
export function recordCount(
  product: ProductRecord,
  expected: number,
  counted: number,
  unitCost: number,
) {
  const { diff, value } = countResult(expected, counted, unitCost);
  return save({ productId: product.id, type: 'count', qty: diff, value, counted, at: Date.now() });
}

/** Admin only: removes a wrong entry. Kept on the server as deleted, and logged. */
export async function deleteMovement(
  movement: StockMovementRecord,
  product: ProductRecord | undefined,
  user: SessionUser,
) {
  await deleteRecord('stockMovements', movement.id);
  const what = `${MOVEMENT_TYPE_LABELS[movement.type]} ${product?.name ?? ''}`.trim();
  await logAudit({
    action: 'stock.delete',
    user,
    targetId: movement.id,
    summary: `${what}: ${movement.qty} (${formatSYP(Math.abs(movement.value))})`,
    reason: '',
  });
}
