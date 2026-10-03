/** Life of a car in the wash, in order. */
export const TICKET_STATUSES = ['waiting', 'washing', 'grace', 'delivered', 'cancelled'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const OPEN_TICKET_STATUSES = ['waiting', 'washing', 'grace'] as const;
export type OpenTicketStatus = (typeof OPEN_TICKET_STATUSES)[number];

export const isOpenTicket = (status: TicketStatus): status is OpenTicketStatus =>
  (OPEN_TICKET_STATUSES as readonly string[]).includes(status);

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  waiting: 'بانتظار',
  washing: 'قيد الغسيل',
  grace: 'في الكراج (مهلة الاستلام)',
  delivered: 'مُسلّمة',
  cancelled: 'ملغاة',
};

/**
 * Which status may follow which.
 * - washing -> delivered: the customer waited at the shop, no WhatsApp notice needed.
 * - any -> cancelled: admin only (checked on the server too), even after delivery.
 */
const NEXT: Record<TicketStatus, TicketStatus[]> = {
  waiting: ['washing', 'cancelled'],
  washing: ['grace', 'delivered', 'cancelled'],
  grace: ['delivered', 'cancelled'],
  delivered: ['cancelled'],
  cancelled: [],
};

export function canMoveTicket(from: TicketStatus, to: TicketStatus): boolean {
  return NEXT[from].includes(to);
}
