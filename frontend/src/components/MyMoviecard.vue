<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';

import type { Movie } from '@/types/movie.ts';

const movieList = ref<Movie[]>([]);

async function fetchMovies() {
    try {
        const response = await axios.get('http://localhost:3000/api/content/movies');
        movieList.value = response.data;
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

onMounted(() => {
    fetchMovies();
});
</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
                v-for="movie in movieList"
                :key="movie.id"
                class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow border border-gray-600 rounded-lg"
            >
                <figure class="px-4 pt-4">
                    <img
                        :src="movie.img"
                        :alt="movie.name"
                        class="rounded-xl h-84 w-full object-cover"
                    />
                </figure>

                <div class="card-body">
                    <h2 class="card-title">{{ movie.name }}</h2>
                    <div class="badge badge-outline mb-2">
                        {{ $t('shows.genres.' + movie.genre) }}
                    </div>

                    <p class="text-sm line-clamp-3 mb-4">
                        {{ movie.description }}
                    </p>

                    <div class="card-actions justify-end">
                        <router-link
                            :to="{ name: 'MovieDetails', params: { id: movie.id } }"
                            class="btn btn-primary btn-sm"
                        >
                            {{ $t('card.watch') }}
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
