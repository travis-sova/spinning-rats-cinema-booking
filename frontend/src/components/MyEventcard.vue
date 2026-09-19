<template>
    <div
        class="card bg-gradient-to-r from-secondary to-secondary-focus shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition duration-300 border border-gray-600 rounded-lg overflow-hidden animate-fadeIn"
    >
        <figure>
            <img :src="event.image" :alt="event.title" class="object-cover w-full h-48" />
        </figure>
        <div class="card-body">
            <h2 class="card-title text-lg text-primary-content">{{ $t(event.title) }}</h2>
            <p class="text-primary-content">{{ $t(event.description) }}</p>
            <p class="text-sm text-primary-content">{{ $t('events.date') }} {{ $t(event.date) }}</p>
            <p class="text-sm text-primary-content">{{ $t('events.time') }} {{ $t(event.time) }}</p>
            <p class="text-sm text-primary-content">
                {{ $t('events.location') }} {{ $t(event.location) }}
            </p>
            <div class="card-actions justify-end">
                <router-link
                    :to="{ name: 'EventTickets', params: { id: event.id } }"
                    class="btn btn-accent text-primary-content"
                >
                    {{ $t('events.purchase') }}
                </router-link>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        event: {
            type: Object,
            required: true,
        },
    },
};
</script>
