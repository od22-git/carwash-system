import type { AuditAction, SessionUser } from '@carwash/shared';
import { saveRecord } from '../sync';

interface AuditInput {
  action: AuditAction;
  user: SessionUser;
  /** The record the action was about. */
  targetId: string;
  /** Short readable summary, e.g. "A-000123 حلب 1234 (45,000 ل.س)". */
  summary: string;
  reason: string;
}

/** Records a sensitive action (who, what, why). Only the admin's laptop reads these. */
export function logAudit({ action, user, targetId, summary, reason }: AuditInput) {
  return saveRecord('auditEvents', {
    action,
    userId: user.id,
    userName: user.name,
    targetId,
    summary,
    reason: reason.trim(),
  });
}
