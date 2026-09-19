<script setup lang="ts">
import MyMoviecard from '@/components/MyMovieCard.vue';
</script>

<template>
    <div class="movie-cards-container">
        <div class="movie-cards">
            <MyMoviecard />
        </div>
    </div>
</template>

<style scoped>
.movie-cards-container {
    display: flex;
    justify-content: center;
    /* Center the grid horizontally */
    align-items: center;
    /* Center the grid vertically */
    width: 100%;
}

.movie-cards {
    display: grid;
    gap: 20px;
    max-width: 1400px;
    width: 100%;
}
</style>
