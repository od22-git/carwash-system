import {
  canMoveParking,
  formatSYP,
  HOURLY_PLAN_NAME,
  parkingCharge,
  toParkingPlan,
  type CustomerRecord,
  type GarageSettings,
  type ParkingPlan,
  type ParkingPlanRecord,
  type ParkingSessionRecord,
  type ParkingStatus,
  type SessionUser,
  type VehicleRecord,
} from '@carwash/shared';
import { logAudit } from '../../../core/audit';
import { nextReceiptNo } from '../../../core/db';
import { saveRecord } from '../../../core/sync';

/** The plan picked when the car enters, with the name printed on the receipt. */
export interface PlanChoice {
  planName: string;
  plan: ParkingPlan;
}

export const HOURLY_CHOICE: PlanChoice = { planName: HOURLY_PLAN_NAME, plan: { kind: 'hourly' } };

export const planChoice = (record: ParkingPlanRecord): PlanChoice => ({
  planName: record.name,
  plan: toParkingPlan(record),
});

export interface NewParking {
  customer: CustomerRecord;
  vehicle: VehicleRecord;
  choice: PlanChoice;
  /** The car's package covers the garage until then. */
  coveredUntil: number | null;
  notes: string;
}

export async function parkCar(input: NewParking): Promise<ParkingSessionRecord> {
  const row = {
    receiptNo: await nextReceiptNo(),
    customerId: input.customer.id,
    vehicleId: input.vehicle.id,
    customerName: input.customer.name,
    plate: input.vehicle.plate,
    ...input.choice,
    coveredUntil: input.coveredUntil,
    status: 'parked',
    enteredAt: Date.now(),
    notes: input.notes.trim(),
  };
  return (await saveRecord('parkingSessions', row)) as ParkingSessionRecord;
}

async function move(
  session: ParkingSessionRecord,
  to: ParkingStatus,
  changes: Partial<ParkingSessionRecord>,
) {
  if (!canMoveParking(session.status, to)) {
    throw new Error(`A ${session.status} parking session cannot become ${to}`);
  }
  const row = { id: session.id, status: to, ...changes };
  return (await saveRecord('parkingSessions', row)) as ParkingSessionRecord;
}

/**
 * The car leaves and pays its plan (less what its package covers), now or on the
 * customer's account (`paidLater`, آجل).
 */
export function releaseCar(
  session: ParkingSessionRecord,
  settings: GarageSettings,
  paidLater = false,
) {
  const now = Date.now();
  const { fee, billedHours } = parkingCharge(session, now, settings);
  return move(session, 'left', { leftAt: now, fee, billedHours, paidLater });
}

/** Admin only. The receipt stays (marked cancelled) and the action is logged. */
export async function cancelParking(
  session: ParkingSessionRecord,
  reason: string,
  user: SessionUser,
) {
  const cancelled = await move(session, 'cancelled', {
    cancelledAt: Date.now(),
    cancelReason: reason.trim(),
  });
  await logAudit({
    action: 'parking.cancel',
    user,
    targetId: session.id,
    summary: `${session.receiptNo} ${session.plate} (${formatSYP(session.fee)})`,
    reason,
  });
  return cancelled;
}
