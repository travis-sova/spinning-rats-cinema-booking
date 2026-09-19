<template>
    <div v-if="isLoading" class="flex flex-col items-center justify-center p-8 text-gray-500">
        <div
            class="w-10 h-10 border-4 border-gray-200 border-l-blue-600 rounded-full animate-spin mb-4"
        ></div>
        <p>Loading movies...</p>
    </div>

    <div
        v-if="error"
        class="p-8 bg-red-50 text-red-600 rounded-lg text-center max-w-2xl mx-auto my-8 font-medium"
    >
        {{ error }}
    </div>

    <div v-if="show" class="container mx-auto p-6">
        <div class="card shadow-xl bg-primary text-primary-content rounded-lg p-6">
            <h2 class="text-3xl font-bold mb-4">{{ show.movie_name }}</h2>
            <p class="text-lg text-primary-content mb-6">{{ show.description }}</p>

            <div class="stats shadow bg-secondary text-primary-content rounded-lg p-4 mb-4">
                <div class="stat">
                    <div class="stat-title text-primary-content">{{ $t('ticket.available') }}</div>
                    <div class="stat-value text-primary-content">{{ availableSeats }}</div>
                </div>
            </div>

            <div class="bg-secondary p-4 rounded-lg shadow">
                <div
                    v-for="ticket in tickets"
                    :key="ticket.type"
                    class="flex justify-between items-center py-3 border-b-2 border-primary"
                >
                    <div>
                        <h3 class="font-bold text-lg text-primary-content">
                            {{ $t(ticket.label) }}
                        </h3>
                        <p class="text-sm text-primary-content">{{ $t(ticket.description) }}</p>
                    </div>
                    <div class="flex items-center">
                        <span class="text-lg font-bold mr-4 text-primary-content"
                            >{{ ticket.price }} €</span
                        >
                        <button
                            @click="decreaseCount(ticket.type)"
                            class="btn btn-sm btn-gray"
                            :disabled="ticketCounts[ticket.type] === 0"
                        >
                            −
                        </button>
                        <span class="mx-2 text-primary-content">{{
                            ticketCounts[ticket.type]
                        }}</span>
                        <button
                            @click="increaseCount(ticket.type)"
                            class="btn btn-sm btn-accent"
                            :disabled="
                                totalTickets >= availableSeats ||
                                selectedSeats.length >= availableSeats
                            "
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            <div class="mt-6 bg-secondary p-4 rounded-lg drop-shadow-lg">
                <h3 class="text-lg font-bold mb-4 text-primary-content">
                    {{ $t('ticket.seats') }}
                </h3>
                <div
                    class="border border-black font-bold text-center text-white p-1 bg-black/50 mb-2"
                >
                    {{ $t('ticket.screen') }}
                </div>
                <div class="grid grid-cols-5 justify-items-center gap-2 p-2">
                    <button
                        v-for="seat in seatLayout"
                        :key="seat.id"
                        @click="toggleSeatSelection(seat.id)"
                        :class="[
                            'w-12 h-10 rounded-lg',
                            seat.reserved
                                ? 'bg-error text-error'
                                : seat.selected
                                  ? 'bg-success text-white'
                                  : 'bg-primary text-primary-content',
                        ]"
                        :disabled="
                            seat.reserved ||
                            (!seat.selected && selectedSeats.length >= totalTickets)
                        "
                    >
                        {{ seat.label }}
                    </button>
                </div>
            </div>

            <div class="mt-4 text-lg font-bold text-right text-primary-content">
                {{ $t('ticket.total') }} {{ totalPrice }} €
            </div>

            <div class="mt-6 flex justify-center gap-4">
                <router-link
                    :to="{ name: 'MovieDetails', params: { id: show.movie } }"
                    class="btn btn-lg btn-accent"
                >
                    {{ $t('ticket.back') }}
                </router-link>
                <button
                    type="button"
                    class="btn btn-lg btn-accent"
                    :disabled="!canPurchase"
                    @click="purchase"
                >
                    {{ $t('ticket.purchase') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

import type { Ticket } from '@/types/ticket.ts';
import type { TicketType } from '@/types/tickettype.ts';
import type { Seat } from '@/types/seat.ts';
import type { Show } from '@/types/show.ts';

const show = ref<Show | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

const router = useRouter();
const route = useRoute();
const showId = Number(route.params.id);

const canPurchase = computed(
    () => totalTickets.value > 0 && selectedSeats.value.length === totalTickets.value,
);

function purchase() {
    if (!canPurchase.value || !show.value) return;

    router.push({
        name: 'Purchase',
        params: { id: show.value.id },
        query: {
            total: totalPrice.value,
            seats: selectedSeats.value.join(','),
        },
    });
}

const fetchData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
        const [showRes] = await Promise.all([
            axios.get<Show>(`http://localhost:3000/api/shows/show/` + showId),
        ]);

        show.value = showRes.data;

        seatLayout.value = generateSeatLayout();
    } catch (err) {
        error.value = axios.isAxiosError(err)
            ? err.response?.data?.error || err.message
            : 'Failed to fetch data';
        console.error('Error fetching data:', err);
    } finally {
        isLoading.value = false;
    }
};

fetchData();

const ticketCounts = ref<Record<TicketType, number>>({ Adult: 0, Student: 0, Senior: 0, Child: 0 });
const tickets: Ticket[] = [
    {
        type: 'Adult',
        label: 'ticket.adult.label',
        price: 10.6,
        description: 'ticket.adult.description',
    },
    {
        type: 'Student',
        label: 'ticket.student.label',
        price: 8.38,
        description: 'ticket.student.description',
    },
    {
        type: 'Senior',
        label: 'ticket.senior.label',
        price: 6.45,
        description: 'ticket.senior.description',
    },
    {
        type: 'Child',
        label: 'ticket.child.label',
        price: 6.45,
        description: 'ticket.child.description',
    },
];

const availableSeats = computed(() => show.value?.seats || 0);
const totalSeats = 100;
const reservedSeatsCount = computed(() => totalSeats - availableSeats.value);
const seatLayout = ref<Seat[]>([]);

function generateSeatLayout() {
    const seats = Array.from({ length: totalSeats }, (_, i) => ({
        id: i + 1,
        label: `S${i + 1}`,
        selected: false,
        reserved: false,
    }));

    const reservedIndices = new Set<number>();
    while (reservedIndices.size < reservedSeatsCount.value) {
        reservedIndices.add(Math.floor(Math.random() * totalSeats));
    }
    reservedIndices.forEach((index) => {
        const seat = seats[index];

        if (seat) {
            seat.reserved = true;
        }
    });

    return seats;
}

const totalTickets = computed(() =>
    Object.values(ticketCounts.value).reduce((sum, count) => sum + count, 0),
);

const totalPrice = computed(() =>
    tickets
        .reduce((sum, ticket) => sum + ticketCounts.value[ticket.type] * ticket.price, 0)
        .toFixed(2),
);

const selectedSeats = computed(() =>
    seatLayout.value.filter((seat) => seat.selected).map((seat) => seat.label),
);

function increaseCount(type: TicketType) {
    if (totalTickets.value < availableSeats.value) {
        ticketCounts.value[type]++;
    }
}

function decreaseCount(type: TicketType) {
    if (ticketCounts.value[type] > 0) {
        ticketCounts.value[type]--;
    }
}

function toggleSeatSelection(seatId: number) {
    const seat = seatLayout.value.find((s) => s.id === seatId);
    if (seat && !seat.reserved) {
        seat.selected = !seat.selected;
    }
}
</script>

<style scoped>
.grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    /* Adjust for a grid of 10 columns */
    gap: 8px;
}

button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}
</style>
