<template>
    <div
        v-if="cinema"
        class="cinema-info bg-secondary p-4 shadow-lg rounded-md mt-4 transition-transform transform duration-500 animate-fadeIn animate-slideDown text-justify text-primary-content flex flex-col sm:flex-row items-start space-x-4 mb-8"
    >
        <img
            v-if="cinema.image"
            :src="cinema.image"
            alt="Cinema Image"
            class="w-400 h-48 object-cover rounded-md place-self-center"
        />

        <div class="flex-1">
            <p class="text-lg font-semibold mb-2">{{ cinema.name }}</p>
            <p v-html="cinema.seats"></p>
            <p v-html="cinema.halls"></p>
            <p v-html="cinema.description"></p>
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { Cinema } from '@/types/cinema.ts';

export default {
    props: {
        cinema: {
            type: Object as PropType<Cinema>,
            required: false,
        },
    },
};
</script>
