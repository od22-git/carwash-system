/** Life of a car in the wash, in order. */
export const TICKET_STATUSES = ['waiting', 'washing', 'grace', 'delivered', 'cancelled'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  waiting: 'بانتظار',
  washing: 'قيد الغسيل',
  grace: 'في الكراج (مهلة الاستلام)',
  delivered: 'مُسلّمة',
  cancelled: 'ملغاة',
};

/** Which status may follow which. Cancelling is allowed from any open status (admin only). */
const NEXT: Record<TicketStatus, TicketStatus[]> = {
  waiting: ['washing', 'cancelled'],
  washing: ['grace', 'cancelled'],
  grace: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export function canMoveTicket(from: TicketStatus, to: TicketStatus): boolean {
  return NEXT[from].includes(to);
}
