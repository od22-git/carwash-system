import {
  normalizeSyrianPhone,
  toLatinDigits,
  type PayType,
  type WorkerRecord,
} from '@carwash/shared';
import { saveRecord } from '../../../core/sync';

export interface WorkerInput {
  name: string;
  phone: string;
  payType: PayType;
  /** As typed: "30", "75,000", "٣٠". */
  rate: string;
  active: boolean;
}

export const parseRate = (text: string) =>
  Number(toLatinDigits(text).replace(/[^\d.]/g, '') || NaN);

export async function saveWorker(input: WorkerInput, id?: string): Promise<WorkerRecord> {
  const phone = input.phone.trim();
  const row = {
    id,
    name: input.name.trim(),
    phone: normalizeSyrianPhone(phone) ?? phone,
    payType: input.payType,
    rate: parseRate(input.rate),
    active: input.active,
  };
  return (await saveRecord('workers', row)) as WorkerRecord;
}
