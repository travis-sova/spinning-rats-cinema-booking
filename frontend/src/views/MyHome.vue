<script setup lang="ts">
import MyCarousel from '@/components/MyCarousel.vue';
import MyShows from '@/components/MyShows.vue';
import MyShowCard from '@/components/MyShowCard.vue';
import MyMessage from '@/components/MyMessage.vue';

import { ref } from 'vue';

const selectedDate = ref('');
const selectedGenre = ref('All');
const sortTitleOption = ref('A-Z');

function handleSortChange(options: { date: string; genre: string; title: string }) {
    selectedDate.value = options.date;
    selectedGenre.value = options.genre;
    sortTitleOption.value = options.title;
}
</script>

<template>
    <div>
        <MyMessage />
        <MyCarousel />
        <MyShows @sort-option-changed="handleSortChange" />
        <div class="movie-cards-container">
            <div class="movie-cards">
                <MyShowCard
                    :selectedDate="selectedDate"
                    :selectedGenre="selectedGenre"
                    :sortTitleOption="sortTitleOption"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.movie-cards-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}

.movie-cards {
    display: grid;
    gap: 20px;
    /* Increase gap for better spacing */
    max-width: 1400px;
    width: 100%;
}
</style>
