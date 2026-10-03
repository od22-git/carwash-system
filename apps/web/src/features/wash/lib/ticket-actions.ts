import {
  canMoveTicket,
  deliveryTotals,
  formatSYP,
  sumLines,
  type CustomerRecord,
  type GarageSettings,
  type SessionUser,
  type TicketLine,
  type TicketRecord,
  type TicketStatus,
  type VehicleRecord,
} from '@carwash/shared';
import { logAudit } from '../../../core/audit';
import { nextReceiptNo } from '../../../core/db';
import { saveRecord } from '../../../core/sync';
import { NO_PACKAGE, type PackageUse } from './package-use';

export interface NewTicket {
  customer: CustomerRecord;
  vehicle: VehicleRecord;
  lines: TicketLine[];
  workerId: string;
  /** The customer asked for this worker. */
  requestedWorker: boolean;
  /** The worker is washing another car, so this one waits. */
  workerBusy: boolean;
  notes: string;
  packageUse?: PackageUse;
}

export async function createTicket(input: NewTicket): Promise<TicketRecord> {
  const now = Date.now();
  const pkg = input.packageUse ?? NO_PACKAGE;
  const washTotal = sumLines(input.lines) - pkg.packageDiscount;
  const row = {
    receiptNo: await nextReceiptNo(),
    customerId: input.customer.id,
    vehicleId: input.vehicle.id,
    customerName: input.customer.name,
    plate: input.vehicle.plate,
    size: input.vehicle.size,
    workerId: input.workerId,
    requestedWorker: input.requestedWorker,
    status: input.workerBusy ? 'waiting' : 'washing',
    lines: input.lines,
    ...pkg,
    washTotal,
    total: washTotal,
    arrivedAt: now,
    startedAt: input.workerBusy ? null : now,
    notes: input.notes.trim(),
  };
  return (await saveRecord('tickets', row)) as TicketRecord;
}

async function move(ticket: TicketRecord, to: TicketStatus, changes: Partial<TicketRecord>) {
  if (!canMoveTicket(ticket.status, to)) {
    throw new Error(`A ${ticket.status} ticket cannot become ${to}`);
  }
  return (await saveRecord('tickets', { id: ticket.id, status: to, ...changes })) as TicketRecord;
}

export const startWashing = (ticket: TicketRecord) =>
  move(ticket, 'washing', { startedAt: Date.now() });

/** The customer was told the car is ready; the pickup grace period starts now. */
export const markNotified = (ticket: TicketRecord) =>
  move(ticket, 'grace', { notifiedAt: Date.now() });

/** The car leaves: the garage fee (if late) is added to the total. */
export function deliver(ticket: TicketRecord, settings: GarageSettings) {
  const now = Date.now();
  return move(ticket, 'delivered', { deliveredAt: now, ...deliveryTotals(ticket, now, settings) });
}

/** Admin only. The receipt stays (marked cancelled) and the action is logged. */
export async function cancelTicket(ticket: TicketRecord, reason: string, user: SessionUser) {
  const cancelled = await move(ticket, 'cancelled', {
    cancelledAt: Date.now(),
    cancelReason: reason.trim(),
  });
  await logAudit({
    action: 'ticket.cancel',
    user,
    targetId: ticket.id,
    summary: `${ticket.receiptNo} ${ticket.plate} (${formatSYP(ticket.total)})`,
    reason,
  });
  return cancelled;
}
