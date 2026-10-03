import type { Instant, SYP } from '../common';
import { applyCover, pickupGarageFee, type GarageSettings } from '../garage';
import type { TicketLine } from './ticket-record';

export const sumLines = (lines: Pick<TicketLine, 'price'>[]): SYP =>
  lines.reduce((sum, line) => sum + line.price, 0);

export interface DeliveryTotals {
  garageFee: SYP;
  garageHours: number;
  total: SYP;
}

/**
 * What the customer pays when picking the car up: the wash, plus the garage fee when the
 * car stayed past the pickup grace after the WhatsApp notice. No notice -> no garage fee
 * (the customer waited at the shop). A package with the garage covers that fee.
 */
export function deliveryTotals(
  ticket: { washTotal: SYP; notifiedAt: number | null; coveredUntil?: number | null },
  pickedUpAt: Instant,
  settings: GarageSettings,
): DeliveryTotals {
  if (ticket.notifiedAt === null) {
    return { garageFee: 0, garageHours: 0, total: ticket.washTotal };
  }
  const late = pickupGarageFee(ticket.notifiedAt, pickedUpAt, settings);
  const { fee, billedHours } = applyCover(late, ticket.coveredUntil ?? null, pickedUpAt, settings);
  return { garageFee: fee, garageHours: billedHours, total: ticket.washTotal + fee };
}
