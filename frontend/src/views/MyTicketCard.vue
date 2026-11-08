<script setup lang="ts">
import JsBarcode from 'jsbarcode';
import { onMounted, ref, watch } from 'vue';

const props = defineProps<{
    title: string;
    seat: string;
    price: number;
    code: string;
    typeLabel?: string;
    place?: string;
    date?: string;
    time?: string;
}>();

const barcode = ref<SVGSVGElement | null>(null);

function renderBarcode() {
    if (!barcode.value) return;
    barcode.value.replaceChildren();
    if (!props.code) return;

    JsBarcode(barcode.value, props.code, {
        format: 'CODE128',
        width: 2,
        height: 64,
        displayValue: false,
        margin: 0,
        lineColor: '#111827',
    });
}

onMounted(renderBarcode);
watch(() => props.code, renderBarcode);
</script>

<template>
    <article
        class="relative flex flex-col md:flex-row bg-base-100 shadow-xl border border-gray-600 rounded-lg"
    >
        <div class="flex-1 p-6">
            <div class="flex items-start justify-between gap-3">
                <h2 class="text-2xl font-bold">{{ title }}</h2>
                <span v-if="typeLabel" class="badge badge-outline opacity-75 shrink-0">{{
                    typeLabel
                }}</span>
            </div>

            <div class="mt-3">
                <div v-if="place" class="font-semibold">{{ place }}</div>
                <div class="flex gap-2 text-sm mt-1">
                    <span v-if="date">{{ date }}</span>
                    <span v-if="time" class="text-blue-600 bg-blue-50 px-2 rounded">{{
                        time
                    }}</span>
                </div>
            </div>

            <div class="divider my-3"></div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <div class="text-sm opacity-70">{{ $t('ticket.seat') }}</div>
                    <div class="font-semibold">{{ seat }}</div>
                </div>
                <div>
                    <div class="text-sm opacity-70">Price</div>
                    <div class="font-semibold">{{ price.toFixed(2) }} €</div>
                </div>
            </div>
        </div>

        <div
            class="relative flex flex-col items-center justify-center gap-2 p-6 md:w-56 border-t-2 md:border-t-0 md:border-l-2 border-dashed border-gray-500"
        >
            <span
                class="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-base-100 ticket-notch"
            ></span>
            <span
                class="absolute -top-3 -right-3 md:top-auto md:right-auto md:-bottom-3 md:-left-3 h-6 w-6 rounded-full bg-base-100 ticket-notch"
            ></span>

            <svg
                v-if="code"
                ref="barcode"
                class="w-full max-w-[220px]"
                role="img"
                :aria-label="`Code 128 barcode for ticket ${code}`"
            ></svg>
            <p class="font-mono text-sm tracking-widest">{{ code }}</p>
        </div>
    </article>
</template>
