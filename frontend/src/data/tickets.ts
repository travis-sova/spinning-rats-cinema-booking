import type { Ticket } from '@/types/ticket.ts';
import type { TicketType } from '@/types/tickettype.ts';

export const DEFAULT_TICKET_PRICES_CENTS: Record<TicketType, number> = {
    Adult: 1060,
    Student: 838,
    Senior: 645,
    Child: 645,
};

const TICKET_DETAILS: Record<TicketType, Pick<Ticket, 'label' | 'description'>> = {
    Adult: {
        label: 'ticket.adult.label',
        description: 'ticket.adult.description',
    },
    Student: {
        label: 'ticket.student.label',
        description: 'ticket.student.description',
    },
    Senior: {
        label: 'ticket.senior.label',
        description: 'ticket.senior.description',
    },
    Child: {
        label: 'ticket.child.label',
        description: 'ticket.child.description',
    },
};

export function createTickets(pricesCents = DEFAULT_TICKET_PRICES_CENTS): Ticket[] {
    return (Object.keys(TICKET_DETAILS) as TicketType[]).map((type) => ({
        type,
        ...TICKET_DETAILS[type],
        price: pricesCents[type] / 100,
    }));
}
