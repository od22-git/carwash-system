import { z } from 'zod';
import { syncRecordBase } from '../contracts/sync';

export const AUDIT_ACTIONS = ['ticket.cancel', 'parking.cancel', 'subscription.cancel'] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  'ticket.cancel': 'إلغاء إيصال غسيل',
  'parking.cancel': 'إلغاء إيصال كراج',
  'subscription.cancel': 'إلغاء اشتراك',
};

/**
 * Who did a sensitive action, when, and why. Only ever added, never edited,
 * so the owner can trust it.
 */
export const auditEventRecordSchema = syncRecordBase.extend({
  action: z.enum(AUDIT_ACTIONS),
  userId: z.string().min(1),
  userName: z.string().min(1),
  /** The record the action was about, e.g. the ticket id. */
  targetId: z.string().min(1),
  /** Short readable summary, e.g. "U-000123 حلب 123456 (45,000 ل.س)". */
  summary: z.string().max(200),
  reason: z.string().max(200).default(''),
});
export type AuditEventRecord = z.infer<typeof auditEventRecordSchema>;
