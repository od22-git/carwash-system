import {
  canMoveTicket,
  deliveryTotals,
  formatSYP,
  receiptNumber,
  type CustomerRecord,
  type GarageSettings,
  type SessionUser,
  type TicketLine,
  type TicketRecord,
  type TicketStatus,
  type VehicleRecord,
} from '@carwash/shared';
import { getMeta, nextSequence } from '../../../core/db';
import { saveRecord } from '../../../core/sync';

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
}

export async function createTicket(input: NewTicket): Promise<TicketRecord> {
  const device = await getMeta('device');
  if (!device) throw new Error('This laptop is not registered yet.');
  const now = Date.now();
  const washTotal = input.lines.reduce((sum, line) => sum + line.price, 0);
  const row = {
    receiptNo: receiptNumber(device.prefix, await nextSequence('receipt')),
    customerId: input.customer.id,
    vehicleId: input.vehicle.id,
    customerName: input.customer.name,
    plate: input.vehicle.plate,
    size: input.vehicle.size,
    workerId: input.workerId,
    requestedWorker: input.requestedWorker,
    status: input.workerBusy ? 'waiting' : 'washing',
    lines: input.lines,
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
  await saveRecord('auditEvents', {
    action: 'ticket.cancel',
    userId: user.id,
    userName: user.name,
    targetId: ticket.id,
    summary: `${ticket.receiptNo} ${ticket.plate} (${formatSYP(ticket.total)})`,
    reason: reason.trim(),
  });
  return cancelled;
}
