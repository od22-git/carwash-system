import { z } from 'zod';

/** Fields every synced record has. Times are epoch milliseconds. */
export const syncRecordBase = z.object({
  id: z.string().min(1).max(64),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
  deviceId: z.string().min(1),
  deletedAt: z.number().int().nullable(),
});
export type SyncRecord = z.infer<typeof syncRecordBase>;

export const MAX_PUSH_OPS = 500;

export const syncOpSchema = z.object({
  table: z.string().min(1),
  row: syncRecordBase.passthrough(),
});
export type SyncOp = z.infer<typeof syncOpSchema>;

export const pushRequestSchema = z.object({ ops: z.array(syncOpSchema).max(MAX_PUSH_OPS) });
export type PushRequest = z.infer<typeof pushRequestSchema>;

export interface PushResponse {
  /** Saved, or already newer on the server. Either way the laptop can drop it from its outbox. */
  accepted: string[];
  /** Not allowed or invalid. Kept on the laptop and shown to the admin. */
  rejected: { table: string; id: string; reason: string }[];
}

export interface PullResponse {
  changes: { table: string; rows: Record<string, unknown>[] }[];
  /** Pass back as `since` on the next pull. */
  cursor: number;
  hasMore: boolean;
}
