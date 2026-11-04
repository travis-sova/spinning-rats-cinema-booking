<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useI18n } from 'vue-i18n';

import { events } from '@/data/events.ts';
import type { Show } from '@/types/show.ts';
import TicketCard from '@/views/MyTicketCard.vue';

type Step = 'checkout' | 'processing' | 'success' | 'failed' | 'expired';

interface Order {
    id: string;
    kind: 'show' | 'event';
    itemId: number;
    status: 'pending' | 'paid' | 'expired';
    total: number;
    cardLast4: string | null;
    tickets: { seat: string; type: string; price: number; code: string | null }[];
}

interface Info {
    title: string;
    place: string;
    date: string;
    time: string;
}

const API = 'http://localhost:3000/api';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const orderId = String(route.params.orderId);

const order = ref<Order | null>(null);
const info = ref<Info | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const step = ref<Step>('checkout');

const total = computed(() => order.value?.total ?? 0);
const isEvent = computed(() => order.value?.kind === 'event');
const typeLabel = (type: string) => t(`ticket.${type.toLowerCase()}.label`);

const errorMessage = (err: unknown, fallback: string) =>
    axios.isAxiosError(err) ? err.response?.data?.error || err.message : fallback;

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

const fetchData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
        const orderRes = await axios.get<Order>(`${API}/orders/${orderId}`);
        order.value = orderRes.data;

        if (orderRes.data.kind === 'event') {
            const ev = events.find((e) => e.id === orderRes.data.itemId);
            if (!ev) throw new Error('Event not found');
            info.value = {
                title: t(ev.title),
                place: t(ev.location),
                date: t(ev.date),
                time: t(ev.time),
            };
        } else {
            const showRes = await axios.get<Show>(`${API}/shows/show/${orderRes.data.itemId}`);
            const s = showRes.data;
            info.value = {
                title: s.movie_name ?? 'Unknown movie',
                place: s.cinema_name ?? '',
                date: formatDate(s.date),
                time: s.time,
            };
        }

        if (orderRes.data.status === 'paid') step.value = 'success';
        else if (orderRes.data.status === 'expired') step.value = 'expired';
    } catch (err) {
        error.value = errorMessage(err, 'Failed to fetch data');
        console.error('Error fetching data:', err);
    } finally {
        isLoading.value = false;
    }
};

const form = reactive({ name: '', number: '', expiry: '', cvc: '' });
const errors = reactive<Record<string, string>>({});
const failureReason = ref('');

const last4 = computed(() => form.number.replace(/\s/g, '').slice(-4));

function onCardInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 16);
    form.number = digits.replace(/(.{4})/g, '$1 ').trim();
    input.value = form.number;
}

function onExpiryInput(e: Event) {
    const input = e.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) digits = digits.slice(0, 2) + '/' + digits.slice(2);
    form.expiry = digits;
    input.value = form.expiry;
}

function fillTestCard(number: string) {
    form.name = form.name || 'Test Customer';
    form.number = number.replace(/(.{4})/g, '$1 ').trim();
    form.expiry = '12/30';
    form.cvc = '123';
}

function validate(): boolean {
    Object.keys(errors).forEach((k) => delete errors[k]);

    if (form.name.trim().length < 2) errors.name = 'Enter the name shown on the card.';
    if (form.number.replace(/\s/g, '').length !== 16)
        errors.number = 'Card number must have 16 digits.';

    const m = /^(\d{2})\/(\d{2})$/.exec(form.expiry);
    if (!m) {
        errors.expiry = 'Enter the date as MM/YY.';
    } else {
        const month = Number(m[1]);
        const year = 2000 + Number(m[2]);
        if (month < 1 || month > 12) errors.expiry = 'Month must be between 01 and 12.';
        else if (new Date(year, month, 1) <= new Date()) errors.expiry = 'This card has expired.';
    }

    if (!/^\d{3,4}$/.test(form.cvc)) errors.cvc = 'Enter the 3 or 4 digit code.';
    return Object.keys(errors).length === 0;
}

async function pay() {
    if (step.value === 'processing' || !validate()) return;

    step.value = 'processing';
    try {
        await axios.post(`${API}/orders/${orderId}/pay`, { last4: last4.value });

        const res = await axios.get<Order>(`${API}/orders/${orderId}`);
        order.value = res.data;
        step.value = 'success';
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 410) {
            step.value = 'expired';
            return;
        }
        failureReason.value = errorMessage(err, 'Payment could not be completed.');
        step.value = 'failed';
    }
}

function retry() {
    form.cvc = '';
    step.value = 'checkout';
}

function printTicket() {
    window.print();
}

onMounted(fetchData);
</script>

<template>
    <div v-if="isLoading" class="flex flex-col items-center justify-center p-8 text-gray-500">
        <div
            class="w-10 h-10 border-4 border-gray-200 border-l-blue-600 rounded-full animate-spin mb-4"
        ></div>
        <p>Loading...</p>
    </div>

    <div
        v-else-if="error"
        class="p-8 bg-red-50 text-red-600 rounded-lg text-center max-w-2xl mx-auto my-8 font-medium"
    >
        {{ error }}
    </div>

    <div v-else-if="info && order" class="container mx-auto p-6">
        <template v-if="step === 'checkout' || step === 'processing'">
            <h1 class="text-3xl font-bold mb-6">{{ $t('ticket.purchase') }}</h1>

            <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <form
                    class="card bg-base-100 shadow-xl border border-gray-600 rounded-lg lg:col-span-3"
                    novalidate
                    @submit.prevent="pay"
                >
                    <div class="card-body space-y-2">
                        <h2 class="card-title">Pay by card</h2>
                        <p class="text-sm opacity-70">
                            Demo checkout. No real payment is made. Your seats are held for 10
                            minutes.
                        </p>

                        <label class="form-control w-full">
                            <span class="label-text mb-1">Name on card</span>
                            <input
                                v-model="form.name"
                                type="text"
                                autocomplete="cc-name"
                                :disabled="step === 'processing'"
                                class="input input-bordered w-full"
                                :class="{ 'input-error': errors.name }"
                                placeholder="Mari Maasikas"
                            />
                            <span v-if="errors.name" class="text-error text-sm mt-1">{{
                                errors.name
                            }}</span>
                        </label>

                        <label class="form-control w-full">
                            <span class="label-text mb-1">Card number</span>
                            <input
                                :value="form.number"
                                type="text"
                                inputmode="numeric"
                                autocomplete="cc-number"
                                :disabled="step === 'processing'"
                                class="input input-bordered w-full font-mono"
                                :class="{ 'input-error': errors.number }"
                                placeholder="4242 4242 4242 4242"
                                @input="onCardInput"
                            />
                            <span v-if="errors.number" class="text-error text-sm mt-1">{{
                                errors.number
                            }}</span>
                        </label>

                        <div class="grid grid-cols-2 gap-4">
                            <label class="form-control w-full">
                                <span class="label-text mb-1">Expiry date</span>
                                <input
                                    :value="form.expiry"
                                    type="text"
                                    inputmode="numeric"
                                    autocomplete="cc-exp"
                                    :disabled="step === 'processing'"
                                    class="input input-bordered w-full font-mono"
                                    :class="{ 'input-error': errors.expiry }"
                                    placeholder="MM/YY"
                                    @input="onExpiryInput"
                                />
                                <span v-if="errors.expiry" class="text-error text-sm mt-1">{{
                                    errors.expiry
                                }}</span>
                            </label>

                            <label class="form-control w-full">
                                <span class="label-text mb-1">Security code</span>
                                <input
                                    v-model="form.cvc"
                                    type="password"
                                    inputmode="numeric"
                                    autocomplete="cc-csc"
                                    maxlength="4"
                                    :disabled="step === 'processing'"
                                    class="input input-bordered w-full font-mono"
                                    :class="{ 'input-error': errors.cvc }"
                                    placeholder="123"
                                />
                                <span v-if="errors.cvc" class="text-error text-sm mt-1">{{
                                    errors.cvc
                                }}</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            class="btn btn-primary w-full mt-4"
                            :disabled="step === 'processing'"
                        >
                            <span
                                v-if="step === 'processing'"
                                class="loading loading-spinner loading-sm"
                            ></span>
                            {{
                                step === 'processing'
                                    ? 'Processing payment...'
                                    : `Pay ${total.toFixed(2)} €`
                            }}
                        </button>

                        <div v-if="step === 'checkout'" class="divider my-2 text-sm">
                            Test cards
                        </div>
                        <div v-if="step === 'checkout'" class="flex flex-wrap gap-2">
                            <button
                                type="button"
                                class="btn btn-xs btn-outline"
                                @click="fillTestCard('4242424242424242')"
                            >
                                Payment succeeds
                            </button>
                            <button
                                type="button"
                                class="btn btn-xs btn-outline"
                                @click="fillTestCard('4000000000000002')"
                            >
                                Card declined
                            </button>
                            <button
                                type="button"
                                class="btn btn-xs btn-outline"
                                @click="fillTestCard('4000000000009995')"
                            >
                                Insufficient funds
                            </button>
                        </div>
                    </div>
                </form>

                <aside
                    class="card bg-base-100 shadow-xl border border-gray-600 rounded-lg h-fit lg:col-span-2"
                >
                    <div class="card-body">
                        <div class="text-sm opacity-70">
                            {{ isEvent ? 'Event' : $t('ticket.movie') }}
                        </div>
                        <h2 class="card-title text-2xl">{{ info.title }}</h2>

                        <div class="mt-1">
                            <div v-if="info.place" class="font-semibold">{{ info.place }}</div>
                            <div class="flex gap-2 text-sm mt-1">
                                <span>{{ info.date }}</span>
                                <span class="text-blue-600 bg-blue-50 px-2 rounded">{{
                                    info.time
                                }}</span>
                            </div>
                        </div>

                        <div class="divider my-2"></div>

                        <div
                            v-for="ticket in order.tickets"
                            :key="ticket.seat"
                            class="flex justify-between gap-4"
                        >
                            <span>
                                <span class="font-semibold">{{ ticket.seat }}</span>
                                <span class="opacity-70"> · {{ typeLabel(ticket.type) }}</span>
                            </span>
                            <span class="font-semibold">{{ ticket.price.toFixed(2) }} €</span>
                        </div>

                        <div class="divider my-2"></div>

                        <div class="flex justify-between items-baseline">
                            <span class="font-semibold">{{ $t('ticket.total') }}</span>
                            <span class="text-2xl font-bold">{{ total.toFixed(2) }} €</span>
                        </div>
                    </div>
                </aside>
            </div>
        </template>

        <div v-else-if="step === 'success'" class="max-w-3xl mx-auto">
            <div role="alert" class="alert alert-success mb-6">
                <span
                    >Payment successful. {{ total.toFixed(2) }} € was charged to the card ending
                    {{ order.cardLast4 }}. Your
                    {{ order.tickets.length === 1 ? 'ticket is' : 'tickets are' }} below.</span
                >
            </div>

            <div class="print-area space-y-6">
                <TicketCard
                    v-for="ticket in order.tickets"
                    :key="ticket.seat"
                    class="ticket-item"
                    :title="info.title"
                    :seat="ticket.seat"
                    :price="ticket.price"
                    :code="ticket.code ?? ''"
                    :type-label="typeLabel(ticket.type)"
                    :place="info.place"
                    :date="info.date"
                    :time="info.time"
                />
            </div>

            <div class="no-print flex flex-wrap justify-center gap-3 mt-6">
                <button type="button" class="btn btn-primary" @click="printTicket">
                    Print {{ order.tickets.length === 1 ? 'ticket' : 'tickets' }}
                </button>
                <router-link :to="isEvent ? '/Events' : '/Movies'" class="btn btn-accent">{{ $t('movie.back') }}</router-link>
            </div>
        </div>

        <div v-else-if="step === 'failed'" class="max-w-lg mx-auto">
            <div role="alert" class="alert alert-error mb-6">
                <div>
                    <h2 class="font-bold">Payment failed</h2>
                    <p>{{ failureReason }}</p>
                    <p class="text-sm">You haven’t been charged. Your seats are still held for you.</p>
                </div>
            </div>

            <div class="flex flex-wrap justify-center gap-3">
                <button type="button" class="btn btn-primary" @click="retry">
                    Try another card
                </button>
                <button type="button" class="btn btn-outline" @click="router.back()">
                    Change seats
                </button>
            </div>
        </div>

        <div v-else-if="step === 'expired'" class="max-w-lg mx-auto">
            <div role="alert" class="alert alert-warning mb-6">
                <div>
                    <h2 class="font-bold">Your seats were released</h2>
                    <p>This order wasn’t paid in time. Please pick your seats again.</p>
                </div>
            </div>

            <div class="flex justify-center">
                <router-link
                    :to="{ name: isEvent ? 'EventTickets' : 'Tickets', params: { id: order.itemId } }"
                    class="btn btn-primary"
                >
                    Choose seats
                </router-link>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    max-width: 1050px;
}
</style>

<style>
@media print {
    body * {
        visibility: hidden;
    }
    .print-area,
    .print-area * {
        visibility: visible;
    }
    .print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
    }
    .ticket-item {
        break-inside: avoid;
    }
    .ticket-notch {
        background: #fff !important;
    }
}
</style>
