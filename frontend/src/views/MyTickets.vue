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
            <p v-if="show.cinema_name" class="mb-4 font-semibold text-primary-content">
                {{ show.cinema_name }}
                <template v-if="show.venue_id">
                    · {{ $t('ticket.venue') }}: {{ $t(`venueNames.${show.venue_id}`) }}
                </template>
            </p>

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
                            >{{ ticket.price.toFixed(2) }} €</span
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
                                totalTickets >= MAX_TICKETS_PER_ORDER ||
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
                <div class="space-y-2 overflow-x-auto p-2">
                    <div
                        v-for="row in seatRows"
                        :key="row.label"
                        class="flex min-w-max items-center justify-center gap-2"
                    >
                        <span class="w-6 text-center text-xs opacity-70">{{ row.label }}</span>
                        <button
                            v-for="seat in row.seats"
                            :key="seat.id"
                            @click="toggleSeatSelection(seat.id)"
                            :class="[
                                'h-10 min-w-10 rounded-lg px-2 text-xs sm:text-sm',
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
            </div>

            <div class="mt-4 text-lg font-bold text-right text-primary-content">
                {{ $t('ticket.total') }} {{ totalPrice }} €
            </div>

            <div v-if="purchaseError" role="alert" class="alert alert-error mt-4">
                <span>{{ purchaseError }}</span>
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
                    :disabled="!canPurchase || isSubmitting"
                    @click="purchase"
                >
                    <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                    {{ $t('ticket.purchase') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

import type { Show } from '@/types/show.ts';
import { createTickets } from '@/data/tickets.ts';
import { MAX_TICKETS_PER_ORDER, useTicketSelection } from '@/composables/useTicketSelection.ts';
import { useAuthStore } from '@/stores/auth.ts';

interface SeatRow {
    row: string;
    seats: string[];
}

const show = ref<Show | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

const isSubmitting = ref(false);
const purchaseError = ref('');

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const showId = Number(route.params.id);
const availableSeats = computed(() => show.value?.seats || 0);
const tickets = computed(() =>
    createTickets(
        show.value
            ? {
                  Adult: show.value.adult_price_cents,
                  Student: show.value.student_price_cents,
                  Senior: show.value.senior_price_cents,
                  Child: show.value.child_price_cents,
              }
            : undefined,
    ),
);
const {
    ticketCounts,
    seatLayout,
    totalTickets,
    totalPrice,
    selectedSeats,
    initializeSeats,
    increaseCount,
    decreaseCount,
    toggleSeatSelection,
} = useTicketSelection(tickets, availableSeats);
const seatRows = computed(() => {
    const rows = new Map<string, typeof seatLayout.value>();
    for (const seat of seatLayout.value) {
        const label = seat.row ?? '';
        const row = rows.get(label) ?? [];
        row.push(seat);
        rows.set(label, row);
    }
    return [...rows].map(([label, seats]) => ({ label, seats }));
});
let seatRefreshTimer: ReturnType<typeof setInterval> | undefined;

const canPurchase = computed(
    () => totalTickets.value > 0 && selectedSeats.value.length === totalTickets.value,
);

async function purchase() {
    if (!canPurchase.value || !show.value || isSubmitting.value) return;

    // Pair the chosen seats with ticket types: Adult first, then Student, and so on.
    const types = tickets.value.flatMap((t) =>
        Array.from({ length: ticketCounts.value[t.type] }, () => t.type),
    );
    const items = types.map((type, i) => ({ type, seat: selectedSeats.value[i] ?? '' }));

    isSubmitting.value = true;
    purchaseError.value = '';
    try {
        const { data } = await axios.post<{ id: string }>(
            'http://localhost:3000/api/orders',
            {
                kind: 'show',
                itemId: show.value.id,
                tickets: items,
            },
            authStore.token
                ? { headers: { Authorization: 'Bearer ' + authStore.token } }
                : undefined,
        );
        router.push({ name: 'Purchase', params: { orderId: data.id } });
    } catch (err) {
        purchaseError.value = axios.isAxiosError(err)
            ? err.response?.data?.error || err.message
            : 'Could not reserve seats';
        if (axios.isAxiosError(err) && err.response?.status === 409) {
            void refreshSeatAvailability();
        }
    } finally {
        isSubmitting.value = false;
    }
}

const fetchData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
        const [showRes, seatsRes] = await Promise.all([
            axios.get<Show>(`http://localhost:3000/api/shows/show/${showId}`),
            axios.get<{
                availableSeats: number;
                reservedSeats: string[];
                totalSeats: number;
                rows: SeatRow[] | null;
            }>(`http://localhost:3000/api/shows/show/${showId}/seats`),
        ]);

        show.value = {
            ...showRes.data,
            seats: seatsRes.data.availableSeats,
        };

        initializeSeats(seatsRes.data.reservedSeats, seatsRes.data.totalSeats, seatsRes.data.rows);
    } catch (err) {
        error.value = axios.isAxiosError(err)
            ? err.response?.data?.error || err.message
            : 'Failed to fetch data';
        console.error('Error fetching data:', err);
    } finally {
        isLoading.value = false;
    }
};

async function refreshSeatAvailability() {
    try {
        const { data } = await axios.get<{
            availableSeats: number;
            reservedSeats: string[];
        }>(`http://localhost:3000/api/shows/show/${showId}/seats`);
        if (show.value) {
            show.value.seats = data.availableSeats;
        }

        const reserved = new Set(data.reservedSeats);
        for (const seat of seatLayout.value) {
            if (reserved.has(seat.label) && seat.selected) {
                seat.selected = false;
                purchaseError.value = `${seat.label} was just reserved by someone else. Please choose another seat.`;
            }
            seat.reserved = reserved.has(seat.label);
        }
    } catch (err) {
        console.error('Failed to refresh seat availability:', err);
    }
}

onMounted(() => {
    void fetchData();
    seatRefreshTimer = setInterval(() => {
        if (show.value) void refreshSeatAvailability();
    }, 15000);
});

onBeforeUnmount(() => {
    if (seatRefreshTimer) clearInterval(seatRefreshTimer);
});
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
