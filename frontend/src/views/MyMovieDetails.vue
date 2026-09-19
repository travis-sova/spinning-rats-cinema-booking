<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import axios from 'axios';

import type { Movie } from '@/types/movie.ts';
import type { Show } from '@/types/show.ts';

const route = useRoute();
const movieId = Number(route.params.id);

const movie = ref<Movie | null>(null);
const shows = ref<Show[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const fetchData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
        const [moviesRes, showsRes] = await Promise.all([
            axios.get<Movie>(`http://localhost:3000/api/movies/${movieId}`),
            axios.get<Show[]>(`http://localhost:3000/api/shows/movie/${movieId}`),
        ]);

        movie.value = moviesRes.data;
        shows.value = showsRes.data;
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

<template>
    <div v-if="isLoading" class="flex flex-col items-center justify-center p-8 text-gray-500">
        <div
            class="w-10 h-10 border-4 border-gray-200 border-l-blue-600 rounded-full animate-spin mb-4"
        ></div>
        <p>Loading movies...</p>
    </div>
    <div
        v-else-if="error"
        class="p-8 bg-red-50 text-red-600 rounded-lg text-center max-w-2xl mx-auto my-8 font-medium"
    >
        {{ error }}
    </div>
    <div v-if="movie" class="container mx-auto p-6">
        <div class="card shadow-xl bg-primary text-primary-content rounded-lg">
            <div class="flex">
                <figure class="w-1/3">
                    <img
                        :src="movie.img"
                        :alt="movie.name"
                        class="w-full h-full object-cover rounded-l-lg"
                    />
                </figure>
                <div class="card-body w-2/3 p-6">
                    <h2 class="card-title text-4xl font-bold">{{ movie.name }}</h2>
                    <div
                        class="badge badge-outline text-sm mb-4 bg-pink-700 text-white border-pink-500"
                    >
                        {{ $t('shows.genres.' + movie.genre) }}
                    </div>
                    <p class="text-primary-content text-lg mb-6">
                        {{ movie.description }}
                    </p>
                    <div class="flex justify-between items-center mt-6">
                        <div class="stats shadow bg-secondary text-primary-content rounded-lg">
                            <div class="stat">
                                <div class="stat-title text-primary-content">
                                    {{ $t('movie.rating') }}
                                </div>
                                <div
                                    class="stat-value"
                                    :class="{
                                        'text-red-500': movie.rating < 20,
                                        'text-yellow-500': movie.rating >= 20 && movie.rating < 50,
                                        'text-green-500': movie.rating >= 50,
                                    }"
                                >
                                    {{ movie.rating }}/100
                                </div>
                            </div>
                        </div>
                        <router-link to="/Movies" class="btn btn-accent mt-4 sm:mt-0 sm:ml-6">
                            {{ $t('movie.back') }}
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-auto">
            <div class="divider my-2 text-sm">{{ $t('movie.showtimes') }}</div>
            <div v-if="shows.length > 0" class="space-y-3">
                <div
                    v-for="show in shows"
                    :key="show.id"
                    class="flex justify-between items-center gap-4"
                >
                    <div>
                        <div class="font-semibold">{{ show.cinema_name }}</div>
                        <div class="flex gap-2 text-sm">
                            <span>{{ formatDate(show.date) }}</span>
                            <span class="text-blue-600 bg-blue-50 px-2 rounded">{{
                                show.time
                            }}</span>
                        </div>
                    </div>

                    <div class="flex flex-col items-end min-w-[120px]">
                        <div class="w-full flex items-center gap-2 mb-1">
                            <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    class="h-full transition-all duration-500"
                                    :class="{
                                        'bg-red-500': show.seats < 20,
                                        'bg-yellow-500': show.seats >= 20 && show.seats < 50,
                                        'bg-green-500': show.seats >= 50,
                                    }"
                                    :style="{ width: `${show.seats}%` }"
                                ></div>
                            </div>
                            <span class="text-xs text-gray-500"
                                >{{ show.seats }} {{ $t('card.seats') }}</span
                            >
                        </div>
                        <!-- params tuleb muuta show.id-le kui ticketid on reaalset iga showga ühendatud -->
                        <router-link
                            :to="{ name: 'Tickets', params: { id: show.id } }"
                            class="btn btn-sm btn-primary"
                        >
                            {{ $t('movie.purchase') }}
                        </router-link>
                    </div>
                </div>
            </div>
            <div v-else class="text-center text-error mt-4">
                {{ $t('movie.no') }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    max-width: 1050px;
}
</style>
