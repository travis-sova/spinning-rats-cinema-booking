import { computed, ref, type ComputedRef } from 'vue';

import type { Seat } from '@/types/seat.ts';
import type { Ticket } from '@/types/ticket.ts';
import type { TicketType } from '@/types/tickettype.ts';

const DEFAULT_SEAT_COUNT = 100;
export const MAX_TICKETS_PER_ORDER = 10;

interface SeatRow {
    row: string;
    seats: string[];
}

export function useTicketSelection(
    tickets: ComputedRef<Ticket[]>,
    availableSeats: ComputedRef<number>,
) {
    const ticketCounts = ref<Record<TicketType, number>>({
        Adult: 0,
        Student: 0,
        Senior: 0,
        Child: 0,
    });
    const seatLayout = ref<Seat[]>([]);

    const totalTickets = computed(() =>
        Object.values(ticketCounts.value).reduce((sum, count) => sum + count, 0),
    );
    const totalPrice = computed(() =>
        (
            tickets.value.reduce(
                (sum, ticket) =>
                    sum + ticketCounts.value[ticket.type] * Math.round(ticket.price * 100),
                0,
            ) / 100
        ).toFixed(2),
    );
    const selectedSeats = computed(() =>
        seatLayout.value.filter((seat) => seat.selected).map((seat) => seat.label),
    );

    function initializeSeats(
        reservedLabels?: string[],
        seatCount = DEFAULT_SEAT_COUNT,
        rows?: SeatRow[] | null,
    ) {
        const seatDefinitions = rows
            ? rows.flatMap(({ row, seats }) => seats.map((label) => ({ row, label })))
            : Array.from({ length: seatCount }, (_, index) => ({
                  row: String(Math.floor(index / 10) + 1),
                  label: `S${index + 1}`,
              }));
        const seats = seatDefinitions.map(({ row, label }, index) => ({
            id: index + 1,
            row,
            label,
            selected: false,
            reserved: false,
        }));
        const labels =
            reservedLabels ??
            seats.slice(0, Math.max(0, seatCount - availableSeats.value)).map((seat) => seat.label);
        const reserved = new Set(labels);

        seats.forEach((seat) => {
            seat.reserved = reserved.has(seat.label);
        });
        seatLayout.value = seats;
    }

    function increaseCount(type: TicketType) {
        if (totalTickets.value < Math.min(availableSeats.value, MAX_TICKETS_PER_ORDER)) {
            ticketCounts.value[type]++;
        }
    }

    function decreaseCount(type: TicketType) {
        if (ticketCounts.value[type] > 0) {
            ticketCounts.value[type]--;
        }
    }

    function toggleSeatSelection(seatId: number) {
        const seat = seatLayout.value.find((item) => item.id === seatId);
        if (seat && !seat.reserved) {
            seat.selected = !seat.selected;
        }
    }

    return {
        ticketCounts,
        seatLayout,
        totalTickets,
        totalPrice,
        selectedSeats,
        initializeSeats,
        increaseCount,
        decreaseCount,
        toggleSeatSelection,
    };
}
