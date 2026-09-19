<script lang="ts">
import CinemaMap from '@/components/MyCinemaMap.vue';
import CinemaInfo from '@/components/MyCinemaInfo.vue';

import type { Cinema } from '@/types/cinema.ts';

export default {
    components: { CinemaMap, CinemaInfo },
    data(): { selectedCinema: Cinema | null } {
        return {
            selectedCinema: null,
        };
    },
    methods: {
        selectCinema(cinema: Cinema) {
            this.selectedCinema = cinema;
        },
    },
};
</script>

<template>
    <div class="container mx-auto rounded-box" style="max-width: 1300px">
        <CinemaMap @selectCinema="selectCinema" />
        <CinemaInfo v-if="selectedCinema" :key="selectedCinema.id" :cinema="selectedCinema" />
    </div>
</template>
