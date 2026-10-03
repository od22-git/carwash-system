import { fillTemplate, whatsappLink, type TicketRecord } from '@carwash/shared';
import { Button, buttonClasses } from '../../../../shared/ui';
import { useWash } from '../../hooks/wash-context';

interface NotifyCustomerProps {
  ticket: TicketRecord;
  /** Starts the pickup grace period. */
  onNotified: () => void;
}

/**
 * Opens WhatsApp with the "car ready" message (the cashier presses send). Without internet
 * or a valid number, the customer can be told another way (a call); the grace period
 * starts either way.
 */
export function NotifyCustomer({ ticket, onNotified }: NotifyCustomerProps) {
  const { customerPhone, readyTemplate, garage, online } = useWash();
  const phone = customerPhone(ticket.customerId);
  const message = fillTemplate(readyTemplate, {
    name: ticket.customerName,
    plate: ticket.plate,
    grace: garage.pickupGraceMinutes,
  });
  const link = phone && online ? whatsappLink(phone, message) : null;

  return (
    <>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          onClick={onNotified}
          className={buttonClasses('primary')}
        >
          تبليغ عبر واتساب
        </a>
      )}
      <Button variant={link ? 'quiet' : 'secondary'} onClick={onNotified}>
        {online ? 'أُبلغ بطريقة أخرى' : 'أُبلغ هاتفياً (لا يوجد إنترنت)'}
      </Button>
    </>
  );
}
