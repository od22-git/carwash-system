import {
  normalizePlate,
  normalizeSyrianPhone,
  type CarSize,
  type CustomerRecord,
  type VehicleRecord,
} from '@carwash/shared';
import { nextCustomerCode } from '../../../core/db';
import { deleteRecord, saveRecord } from '../../../core/sync';

export interface CustomerInput {
  name: string;
  job: string;
  phone: string;
  notes: string;
}

export interface VehicleInput {
  plate: string;
  color: string;
  size: CarSize;
}

/** The phone could not be read as a Syrian mobile number. */
export class InvalidPhoneError extends Error {}

function cleanCustomer(input: CustomerInput) {
  const phone = normalizeSyrianPhone(input.phone);
  if (!phone) throw new InvalidPhoneError();
  return { name: input.name.trim(), job: input.job.trim(), notes: input.notes.trim(), phone };
}

export async function createCustomer(input: CustomerInput): Promise<CustomerRecord> {
  const fields = cleanCustomer(input);
  const code = await nextCustomerCode();
  return (await saveRecord('customers', { ...fields, code })) as CustomerRecord;
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<CustomerRecord> {
  return (await saveRecord('customers', { id, ...cleanCustomer(input) })) as CustomerRecord;
}

export async function saveVehicle(
  customerId: string,
  input: VehicleInput,
  id?: string,
): Promise<VehicleRecord> {
  const row = {
    id,
    customerId,
    plate: normalizePlate(input.plate),
    color: input.color.trim(),
    size: input.size,
  };
  return (await saveRecord('vehicles', row)) as VehicleRecord;
}

export const removeVehicle = (id: string) => deleteRecord('vehicles', id);
