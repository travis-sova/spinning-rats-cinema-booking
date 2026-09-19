import type { TicketType } from './tickettype.ts';

export interface Ticket {
    type: TicketType;
    label: string;
    price: number;
    description: string;
}
