<template>
    <main class="min-h-screen bg-[#f4f2f3] pb-16">
        <div class="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:pt-10">
            <router-link
                to="/Cinemas"
                class="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-rose-700"
            >
                <span aria-hidden="true">←</span>
                {{ $t('cinemaSchedule.backToCinemas') }}
            </router-link>

            <header
                class="relative flex min-h-64 items-end overflow-hidden rounded-3xl bg-[#141116] bg-cover bg-center p-6 text-white shadow-2xl sm:min-h-80 sm:p-10"
                :style="{
                    backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.88), rgba(0,0,0,.3)), url('${cinemaImage}')`,
                }"
            >
                <div class="max-w-3xl">
                    <span
                        class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/85 backdrop-blur"
                    >
                        <span class="h-2 w-2 rounded-full bg-rose-500"></span>
                        {{ $t('cinemaSchedule.title') }}
                    </span>
                    <h1 class="mt-4 text-3xl font-black leading-tight sm:text-5xl">
                        {{ $t(`cinemas.${cinemaId}.name`) }}
                    </h1>
                    <p class="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                        {{ $t('cinemaSchedule.subtitle') }}
                    </p>
                </div>
            </header>

            <section
                class="relative z-10 -mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:mx-6 sm:flex sm:items-end sm:gap-6 sm:p-5"
            >
                <label class="form-control min-w-0 flex-1">
                    <span class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        {{ $t('cinemaSchedule.searchLabel') }}
                    </span>
                    <div class="relative">
                        <span
                            class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400"
                            aria-hidden="true"
                            >⌕</span
                        >
                        <input
                            v-model="searchQuery"
                            type="search"
                            class="input input-bordered h-12 w-full border-slate-300 bg-white pl-11 pr-12 text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-rose-200"
                            :placeholder="$t('cinemaSchedule.searchPlaceholder')"
                        />
                        <button
                            v-if="searchQuery"
                            type="button"
                            class="btn btn-ghost btn-sm absolute right-1 top-1"
                            :aria-label="$t('cinemaSchedule.clearSearch')"
                            @click="searchQuery = ''"
                        >
                            ×
                        </button>
                    </div>
                </label>
                <p
                    v-if="!isLoading && !loadError"
                    class="mt-3 shrink-0 text-sm font-medium text-slate-500 sm:mb-1 sm:mt-0"
                    aria-live="polite"
                >
                    {{ $t('cinemaSchedule.resultCount', { count: filteredShows.length }) }}
                </p>
            </section>

            <section class="mt-10">
                <div v-if="isLoading" class="grid gap-8" aria-live="polite">
                    <div v-for="group in 2" :key="group">
                        <div class="skeleton mb-4 h-7 w-48"></div>
                        <div class="grid gap-4 md:grid-cols-2">
                            <div
                                v-for="card in 2"
                                :key="card"
                                class="skeleton h-52 rounded-2xl"
                            ></div>
                        </div>
                    </div>
                </div>

                <div
                    v-else-if="loadError"
                    role="alert"
                    class="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-white p-8 text-center text-slate-800 shadow-lg"
                >
                    <p class="text-lg font-bold">{{ loadError }}</p>
                    <button type="button" class="btn btn-primary mt-4" @click="loadShows">
                        {{ $t('cinemaSchedule.retry') }}
                    </button>
                </div>

                <div
                    v-else-if="upcomingShows.length === 0"
                    class="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center text-slate-800 shadow-sm"
                >
                    <div
                        class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-3xl"
                        aria-hidden="true"
                    >
                        🎬
                    </div>
                    <h2 class="mt-4 text-xl font-bold">{{ $t('cinemaSchedule.empty') }}</h2>
                </div>

                <div
                    v-else-if="filteredShows.length === 0"
                    class="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center text-slate-800 shadow-sm"
                >
                    <div class="text-3xl" aria-hidden="true">⌕</div>
                    <h2 class="mt-3 text-xl font-bold">{{ $t('cinemaSchedule.noResults') }}</h2>
                    <button class="btn btn-ghost mt-3" type="button" @click="searchQuery = ''">
                        {{ $t('cinemaSchedule.clearSearch') }}
                    </button>
                </div>

                <div v-else class="space-y-10">
                    <section
                        v-for="group in showGroups"
                        :key="group.date"
                        :aria-label="formatDate(group.date)"
                    >
                        <div class="mb-4 flex items-center gap-3">
                            <div
                                class="flex h-12 min-w-12 flex-col items-center justify-center rounded-xl bg-rose-700 px-2 text-white shadow"
                            >
                                <span class="text-[10px] font-bold uppercase leading-none">
                                    {{ formatMonth(group.date) }}
                                </span>
                                <span class="mt-1 text-xl font-black leading-none">
                                    {{ formatDay(group.date) }}
                                </span>
                            </div>
                            <div>
                                <h2 class="text-lg font-bold sm:text-xl">
                                    {{ formatDate(group.date) }}
                                </h2>
                                <p class="text-xs font-medium text-slate-500">
                                    {{
                                        $t('cinemaSchedule.resultCount', {
                                            count: group.shows.length,
                                        })
                                    }}
                                </p>
                            </div>
                            <div class="ml-2 h-px flex-1 bg-slate-300"></div>
                        </div>

                        <div class="grid gap-4 md:grid-cols-2">
                            <article
                                v-for="show in group.shows"
                                :key="show.id"
                                class="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div class="flex min-h-44">
                                    <div
                                        class="relative w-28 shrink-0 overflow-hidden bg-neutral sm:w-36"
                                    >
                                        <img
                                            v-if="show.movie_img"
                                            :src="show.movie_img"
                                            :alt="show.movie_name || ''"
                                            class="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                        />
                                        <div
                                            v-else
                                            class="flex h-full min-h-44 items-center justify-center bg-slate-900 text-4xl text-white/50"
                                            aria-hidden="true"
                                        >
                                            🎬
                                        </div>
                                    </div>

                                    <div class="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                                        <div class="flex items-start justify-between gap-2">
                                            <h3
                                                class="line-clamp-2 text-lg font-extrabold leading-snug text-slate-900 sm:text-xl"
                                            >
                                                {{ show.movie_name }}
                                            </h3>
                                            <span
                                                class="shrink-0 rounded-lg bg-slate-900 px-2.5 py-1.5 text-lg font-black tabular-nums text-white"
                                            >
                                                {{ show.time.slice(0, 5) }}
                                            </span>
                                        </div>

                                        <div class="mt-3 space-y-1 text-sm text-slate-600">
                                            <p v-if="show.venue_id" class="truncate">
                                                <span class="mr-1" aria-hidden="true">▣</span>
                                                {{ $t(`venueNames.${show.venue_id}`) }}
                                            </p>
                                            <p>
                                                <span class="mr-1" aria-hidden="true">◉</span>
                                                {{ show.seats }}
                                                {{ $t('cinemaSchedule.seatsAvailable') }}
                                            </p>
                                        </div>

                                        <router-link
                                            :to="{ name: 'Tickets', params: { id: show.id } }"
                                            class="btn btn-sm mt-auto self-start border-rose-700 bg-rose-700 px-4 text-white hover:border-rose-800 hover:bg-rose-800"
                                        >
                                            {{ $t('cinemaSchedule.book') }}
                                            <span aria-hidden="true">→</span>
                                        </router-link>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </section>
                </div>
            </section>
        </div>
    </main>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import cinemaImage1 from '@/assets/cinemas/BaltiJaamCinema.jpg';
import cinemaImage2 from '@/assets/cinemas/CylinderCinema.jpg';
import cinemaImage3 from '@/assets/cinemas/UnderwaterCinema.jpg';
import type { Show } from '@/types/show.ts';

const route = useRoute();
const { locale } = useI18n();
const cinemaId = computed(() => Number(route.params.id));
const shows = ref<Show[]>([]);
const searchQuery = ref('');
const isLoading = ref(true);
const loadError = ref('');

const cinemaImage = computed(
    () =>
        ({
            1: cinemaImage1,
            2: cinemaImage2,
            3: cinemaImage3,
        })[cinemaId.value] ?? cinemaImage1,
);

const upcomingShows = computed(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate(),
    ).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes(),
    ).padStart(2, '0')}`;

    return shows.value
        .filter(
            (show) =>
                show.cinema === cinemaId.value &&
                (show.date > today || (show.date === today && show.time >= currentTime)),
        )
        .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
});

const filteredShows = computed(() => {
    const query = searchQuery.value.trim().toLocaleLowerCase();
    if (!query) return upcomingShows.value;
    return upcomingShows.value.filter((show) =>
        show.movie_name?.toLocaleLowerCase().includes(query),
    );
});

const showGroups = computed(() => {
    const groups = new Map<string, Show[]>();
    for (const show of filteredShows.value) {
        const group = groups.get(show.date) ?? [];
        group.push(show);
        groups.set(show.date, group);
    }
    return [...groups].map(([date, groupedShows]) => ({ date, shows: groupedShows }));
});

const dateLocale = computed(() => (locale.value === 'ee' ? 'et-EE' : 'en-US'));

function formatDate(dateString: string) {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString(dateLocale.value, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatMonth(dateString: string) {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString(dateLocale.value, {
        month: 'short',
    });
}

function formatDay(dateString: string) {
    return new Date(`${dateString}T00:00:00`).getDate();
}

async function loadShows() {
    isLoading.value = true;
    loadError.value = '';
    try {
        const { data } = await axios.get<Show[]>('http://localhost:3000/api/content/shows');
        shows.value = data;
    } catch (error) {
        loadError.value = axios.isAxiosError(error)
            ? error.response?.data?.error || error.message
            : 'Could not load showtimes.';
        console.error('Failed to load cinema showtimes:', error);
    } finally {
        isLoading.value = false;
    }
}

onMounted(loadShows);
</script>
