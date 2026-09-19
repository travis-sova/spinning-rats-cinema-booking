<template>
    <div class="p-8 bg-base-200 min-h-screen">
        <h1 class="text-4xl font-bold text-center mb-8">{{ $t('events.coming') }}</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EventCard v-for="event in events" :key="event.id" :event="event" />
        </div>
    </div>
</template>

<script lang="ts">
import { events } from '../data/events.ts';
import EventCard from '@/components/MyEventCard.vue';

export default {
    components: { EventCard },
    data() {
        return {
            events,
        };
    },
};
</script>

<style scoped></style>
