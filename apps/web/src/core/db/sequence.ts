import { customerCode, receiptNumber } from '@carwash/shared';
import { db } from './local-db';
import { getMeta, setMeta } from './meta';

export type SequenceKind = 'customer' | 'receipt';

/**
 * Next number for this laptop (1, 2, 3, ...). Combined with the laptop's prefix
 * it never clashes with the other laptop, even offline.
 */
export function nextSequence(kind: SequenceKind): Promise<number> {
  return db.transaction('rw', db.meta, async () => {
    const all = (await getMeta('sequences')) ?? {};
    const next = (all[kind] ?? 0) + 1;
    await setMeta('sequences', { ...all, [kind]: next });
    return next;
  });
}

async function devicePrefix(): Promise<string> {
  const device = await getMeta('device');
  if (!device) throw new Error('This laptop is not registered yet.');
  return device.prefix;
}

/** "A-000123": one series for every receipt this laptop prints (wash, garage, package). */
export const nextReceiptNo = async () =>
  receiptNumber(await devicePrefix(), await nextSequence('receipt'));

/** "A-0012": the customer's code. */
export const nextCustomerCode = async () =>
  customerCode(await devicePrefix(), await nextSequence('customer'));
