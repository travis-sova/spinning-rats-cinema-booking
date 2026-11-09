<template>
    <main class="container mx-auto max-w-4xl p-6" :class="{ printing: printingOrderId !== null }">
        <div class="print-controls mb-6 flex items-center justify-between gap-4">
            <h1 class="text-3xl font-bold">{{ $t('accountTickets.title') }}</h1>
            <router-link to="/Settings" class="btn btn-outline">
                {{ $t('nav.settings') }}
            </router-link>
        </div>

        <p v-if="isLoading" class="py-8 text-center">{{ $t('accountTickets.loading') }}</p>
        <p v-else-if="error" class="alert alert-error" role="alert">{{ error }}</p>
        <p v-else-if="orders.length === 0" class="py-8 text-center">
            {{ $t('accountTickets.empty') }}
        </p>

        <section v-else class="space-y-5">
            <article
                v-for="order in orders"
                :key="order.id"
                class="card bg-base-200 shadow"
                :class="{ 'print-order': printingOrderId === order.id }"
            >
                <div class="card-body">
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <h2 class="card-title">{{ orderTitle(order) }}</h2>
                            <p v-if="order.kind === 'show'">
                                {{ ticketPlace(order) }} · {{ order.showDate }} {{ order.showTime }}
                            </p>
                            <p v-else-if="eventDetails(order)">{{ eventDetails(order) }}</p>
                            <p class="text-sm opacity-75">
                                {{ $t('accountTickets.purchased') }}: {{ order.purchasedAt }}
                            </p>
                        </div>
                        <button
                            type="button"
                            class="print-controls btn btn-outline btn-sm"
                            @click="printOrder(order.id)"
                        >
                            {{ $t('accountTickets.print') }}
                        </button>
                    </div>

                    <div class="account-tickets mt-4 grid gap-5">
                        <TicketCard
                            v-for="ticket in order.tickets"
                            :key="ticket.seat"
                            class="account-ticket"
                            :title="orderTitle(order)"
                            :seat="ticket.seat"
                            :price="ticket.price"
                            :code="ticket.code ?? ''"
                            :type-label="ticketTypeLabel(ticket.type)"
                            :place="ticketPlace(order)"
                            :date="ticketDate(order)"
                            :time="ticketTime(order)"
                        />
                    </div>

                    <p class="mt-2 text-right font-bold">
                        {{ $t('accountTickets.total') }}: {{ order.total.toFixed(2) }} €
                    </p>
                </div>
            </article>
        </section>
    </main>
</template>

<script setup lang="ts">
import axios from 'axios';
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.ts';
import { events } from '@/data/events.ts';
import TicketCard from '@/views/MyTicketCard.vue';

interface AccountTicket {
    seat: string;
    type: string;
    price: number;
    code: string | null;
}

interface AccountOrder {
    id: string;
    kind: 'show' | 'event';
    itemId: number;
    total: number;
    purchasedAt: string;
    movieName: string | null;
    cinemaName: string | null;
    venueId: string | null;
    showDate: string | null;
    showTime: string | null;
    tickets: AccountTicket[];
}

const API = 'http://localhost:3000/api';
const authStore = useAuthStore();
const { t } = useI18n();
const orders = ref<AccountOrder[]>([]);
const isLoading = ref(true);
const error = ref('');
const printingOrderId = ref<string | null>(null);

function finishPrinting() {
    printingOrderId.value = null;
}

async function printOrder(orderId: string) {
    printingOrderId.value = orderId;
    await nextTick();
    await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    window.addEventListener('afterprint', finishPrinting, { once: true });
    window.print();
}

onBeforeUnmount(() => {
    window.removeEventListener('afterprint', finishPrinting);
});

onMounted(async () => {
    try {
        const { data } = await axios.get<AccountOrder[]>(`${API}/orders/mine`, {
            headers: { Authorization: 'Bearer ' + authStore.token },
        });
        orders.value = data;
    } catch (requestError) {
        error.value = axios.isAxiosError(requestError)
            ? requestError.response?.data?.error || t('accountTickets.loadError')
            : t('accountTickets.loadError');
    } finally {
        isLoading.value = false;
    }
});

function orderTitle(order: AccountOrder) {
    if (order.kind === 'show') {
        return order.movieName || `${t('accountTickets.show')} #${order.itemId}`;
    }
    const event = events.find((item) => item.id === order.itemId);
    return event ? t(event.title) : `${t('accountTickets.event')} #${order.itemId}`;
}

function eventDetails(order: AccountOrder) {
    const event = events.find((item) => item.id === order.itemId);
    return event ? `${t(event.date)} · ${t(event.time)} · ${t(event.location)}` : '';
}

function ticketPlace(order: AccountOrder) {
    if (order.kind === 'show') {
        const venue = order.venueId ? t(`venueNames.${order.venueId}`) : '';
        return [order.cinemaName, venue ? `${t('ticket.venue')}: ${venue}` : '']
            .filter(Boolean)
            .join(' · ');
    }
    const event = events.find((item) => item.id === order.itemId);
    return event ? t(event.location) : '';
}

function ticketDate(order: AccountOrder) {
    if (order.kind === 'show') return order.showDate ?? '';
    const event = events.find((item) => item.id === order.itemId);
    return event ? t(event.date) : '';
}

function ticketTime(order: AccountOrder) {
    if (order.kind === 'show') return order.showTime ?? '';
    const event = events.find((item) => item.id === order.itemId);
    return event ? t(event.time) : '';
}

function ticketTypeLabel(type: string) {
    return t('ticket.' + type.toLowerCase() + '.label');
}
</script>

<style scoped>
@media print {
    :global(body *) {
        visibility: hidden !important;
    }

    main.printing,
    main.printing * {
        visibility: visible !important;
    }

    main.printing {
        position: absolute;
        inset: 0;
        width: 100%;
        max-width: none;
        padding: 0;
        background: white;
        color: black;
    }

    main.printing > *:not(section),
    main.printing section > article:not(.print-order),
    main.printing .print-controls {
        display: none !important;
    }

    main.printing .print-order {
        border: 0;
        background: white;
        box-shadow: none;
        color: black;
    }

    main.printing .account-tickets {
        display: block;
    }

    main.printing .account-ticket {
        margin-bottom: 1rem;
        break-inside: avoid;
        border: 1px solid #777;
        background: white;
        color: black;
    }

    main.printing .account-ticket * {
        color: black !important;
    }

    main.printing .ticket-notch {
        background: white;
    }

    main.printing .account-ticket svg {
        max-width: 220px;
        height: 64px;
    }

    main.printing .account-ticket p {
        color: black;
    }

    main.printing .account-ticket .badge {
        color: black;
        border-color: #555;
    }

    main.printing .account-ticket .divider {
        border-color: #777;
    }

    main.printing .account-ticket .text-blue-600 {
        color: black;
    }

    main.printing .account-ticket .bg-blue-50 {
        background: white;
    }

    main.printing .account-ticket {
        page-break-inside: avoid;
    }
}
</style>
