import type { PullResponse } from '@carwash/shared';
import { api } from '../api';
import { getMeta, setMeta } from '../db';
import { applyChanges } from './apply-changes';

/** Fetches every change since the last pull, page by page. Safe to repeat after a crash. */
export async function pullChanges(): Promise<void> {
  let cursor = (await getMeta('syncCursor')) ?? 0;
  for (;;) {
    const page = await api<PullResponse>(`/sync/pull?since=${cursor}`);
    await applyChanges(page.changes);
    cursor = page.cursor;
    await setMeta('syncCursor', cursor);
    if (!page.hasMore) return;
  }
}
