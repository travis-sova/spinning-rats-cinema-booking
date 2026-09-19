<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

import type { Movie } from '@/types/movie.ts';
import type { Show } from '@/types/show.ts';

const movies = ref<Movie[]>([]);
const shows = ref<Show[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const selectedDate = ref('');
const selectedGenre = ref('All'); // Default: Show all genres
const sortTitleOption = ref('A-Z'); // Default: Sort titles A-Z

const emits = defineEmits<{
    'sort-option-changed': [options: { date: string; genre: string; title: string }];
}>();

const genres = computed(() => {
    const movieIds = new Set(shows.value.map((show) => show.movie));

    return [
        ...new Set(
            movies.value.filter((movie) => movieIds.has(movie.id)).map((movie) => movie.genre),
        ),
    ].sort();
});

const dates = computed(() => [...new Set(shows.value.map((show) => show.date))].sort());

function formatDate(date: string) {
    return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function emitFilters() {
    emits('sort-option-changed', {
        date: selectedDate.value,
        genre: selectedGenre.value,
        title: sortTitleOption.value,
    });
}

onMounted(async () => {
    isLoading.value = true;

    try {
        const [moviesRes, showsRes] = await Promise.all([
            axios.get<Movie[]>('http://localhost:3000/api/content/movies'),
            axios.get<Show[]>('http://localhost:3000/api/content/shows'),
        ]);

        movies.value = moviesRes.data;
        shows.value = showsRes.data;
    } catch (err) {
        error.value = axios.isAxiosError(err)
            ? err.response?.data?.error || err.message
            : 'Failed to load filters';
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <p v-if="error" role="alert" class="text-error">
        {{ error }}
    </p>

    <form
        class="menu menu-vertical lg:menu-horizontal w-full justify-start bg-secondary text-primary\"
    >
        <!-- Date dropdown -->
        <div class="mx-5">
            <select
                id="date"
                v-model="selectedDate"
                @change="emitFilters"
                :disabled="isLoading || dates.length === 0"
                class="bg-primary border border-gray-300 text-primary-content text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
                <option value="">{{ $t('shows.date') }}</option>
                <option v-for="date in dates" :key="date" :value="date">
                    {{ formatDate(date) }}
                </option>
            </select>
        </div>
        <!-- Genre dropdown -->
        <div class="mx-5">
            <select
                id="genre-select"
                v-model="selectedGenre"
                @change="emitFilters"
                class="bg-primary border border-gray-300 text-primary-content text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
                <option value="All">{{ $t('shows.genres.all') }}</option>
                <option v-for="genre in genres" :key="genre" :value="genre">
                    {{ $t('shows.genres.' + genre) }}
                </option>
            </select>
        </div>
        <!-- title sort dropdown -->
        <div class="mx-5">
            <select
                id="title-sort-select"
                v-model="sortTitleOption"
                @change="emitFilters"
                class="bg-primary border border-gray-300 text-primary-content text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
                <option value="A-Z">A-Z</option>
                <option value="Z-A">Z-A</option>
            </select>
        </div>
    </form>
</template>

<style scoped>
a {
    margin: 0 1rem;
}

.select-ghost {
    --tw-bg-opacity: 0;
}

.select-ghost:focus {
    --tw-bg-opacity: 0;
    --tw-text-opacity: 1;
    color: var(--fallback-bc, oklch(var(--bc) / var(--tw-text-opacity)));
}
</style>
