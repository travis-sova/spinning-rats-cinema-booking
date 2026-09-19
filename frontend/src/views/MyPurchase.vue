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

    <div v-if="show">
        <h1>{{ $t('ticket.purchase') }}</h1>
        <p>{{ $t('ticket.movie') }} {{ show.movie_name }}</p>
        <p>{{ $t('ticket.total') }} {{ total }} €</p>
        <p>{{ $t('ticket.seat') }} {{ selectedSeats.join(', ') }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

import type { Show } from '@/types/show.ts';

const show = ref<Show | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

const route = useRoute();
const showId = Number(route.params.id);
const total = ref(Number(route.query.total || 0));
const seatsQuery = route.query.seats;
const selectedSeats = ref(typeof seatsQuery === 'string' ? seatsQuery.split(',') : []);

const fetchData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
        const [showRes] = await Promise.all([
            axios.get<Show>('http://localhost:3000/api/shows/show/' + showId),
        ]);

        show.value = showRes.data;
    } catch (err) {
        error.value = axios.isAxiosError(err)
            ? err.response?.data?.error || err.message
            : 'Failed to fetch data';
        console.error('Error fetching data:', err);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchData();
});
</script>
