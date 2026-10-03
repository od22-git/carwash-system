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
