<template>
    <div class="container mx-auto p-6">
        <div class="card shadow-xl bg-primary text-primary-content rounded-lg p-6">
            <h2 class="text-3xl font-bold mb-4">{{ $t(event.title) }}</h2>
            <p class="text-lg text-primary-content mb-6">{{ $t(event.description) }}</p>

            <div class="bg-secondary p-4 rounded-lg drop-shadow-lg">
                <div class="border-b-2 border-primary py-3">
                    <p>
                        <strong>{{ $t('events.date') }}</strong> {{ $t(event.date) }}
                    </p>
                    <p>
                        <strong>{{ $t('events.time') }}</strong> {{ $t(event.time) }}
                    </p>
                    <p>
                        <strong>{{ $t('events.location') }}</strong> {{ $t(event.location) }}
                    </p>
                    <p>
                        <strong>{{ $t('events.seats') }}</strong> {{ event.seats }}
                    </p>
                </div>

                <div class="bg-secondary p-4 rounded-lg drop-shadow-lg">
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

                <div v-if="purchaseError" role="alert" class="alert alert-error mt-4">
                    <span>{{ purchaseError }}</span>
                </div>

                <div class="mt-6 flex justify-center gap-4">
                    <router-link :to="'/events'" class="btn btn-lg btn-accent">
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
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { events } from '../data/events.ts';

import { createTickets } from '@/data/tickets.ts';
import { MAX_TICKETS_PER_ORDER, useTicketSelection } from '@/composables/useTicketSelection.ts';
import { useAuthStore } from '@/stores/auth.ts';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const eventId = Number(route.params.id);

const isSubmitting = ref(false);
const purchaseError = ref('');

const canPurchase = computed(
    () => totalTickets.value > 0 && selectedSeats.value.length === totalTickets.value,
);

async function purchase() {
    if (!canPurchase.value || !event || isSubmitting.value) return;

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
                kind: 'event',
                itemId: event.id,
                tickets: items,
            },
            authStore.token
                ? { headers: { Authorization: 'Bearer ' + authStore.token } }
                : undefined,
        );
        router.push({ name: 'EventPurchase', params: { orderId: data.id } });
    } catch (err) {
        purchaseError.value = axios.isAxiosError(err)
            ? err.response?.data?.error || err.message
            : 'Could not reserve seats';
    } finally {
        isSubmitting.value = false;
    }
}

const event = events.find((e) => e.id === eventId);

if (!event) {
    throw new Error(`Event with ID ${eventId} not found`);
}

const tickets = computed(() => createTickets());
const availableSeats = computed(() => event.seats);
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
initializeSeats();
</script>

<style scoped>
.grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 8px;
}

button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}
</style>
