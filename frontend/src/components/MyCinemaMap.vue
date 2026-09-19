<template>
    <div class="relative w-full h-0 pb-[56.25%] my-8">
        <img
            src="@/assets/kaart.png"
            alt="City Map"
            class="absolute top-0 left-0 w-full h-full object-cover rounded-box"
        />
        <CinemaIcon
            v-for="(cinema, index) in cinemas"
            :key="index"
            :cinema="cinema"
            @selectCinema="selectCinema"
        />
    </div>
</template>

<script setup lang="ts">
import CinemaIcon from './MyCinemaIcon.vue';
import cinemaimage3 from '@/assets/cinemas/UnderwaterCinema.jpg';
import cinemaimage2 from '@/assets/cinemas/CylinderCinema.jpg';
import cinemaimage1 from '@/assets/cinemas/BaltiJaamCinema.jpg';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const cinemas = [
    {
        id: 'cinema3',
        name: t('cinemas.3.name'),
        seats: t('cinemas.3.seats'),
        halls: t('cinemas.3.halls'),
        description: t('cinemas.3.description'),
        image: cinemaimage3,
        position: { top: '75%', left: '50%' },
    },
    {
        id: 'cinema2',
        name: t('cinemas.2.name'),
        seats: t('cinemas.2.seats'),
        halls: t('cinemas.2.halls'),
        description: t('cinemas.2.description'),
        image: cinemaimage2,
        position: { top: '57%', left: '24%' },
    },
    {
        id: 'cinema1',
        name: t('cinemas.1.name'),
        seats: t('cinemas.1.seats'),
        halls: t('cinemas.1.halls'),
        description: t('cinemas.1.description'),
        image: cinemaimage1,
        position: { top: '37%', left: '43%' },
    },
];

const emit = defineEmits(['selectCinema']);

function selectCinema(cinema: object) {
    emit('selectCinema', cinema);
}
</script>
