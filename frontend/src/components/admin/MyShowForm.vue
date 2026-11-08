<template>
    <section class="show-manager">
        <h2>{{ $t('admin.show.title') }}</h2>
        <nav class="tabs" :aria-label="$t('admin.show.title')">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                :class="{ active: activeTab === tab.id }"
                @click="activeTab = tab.id"
            >
                {{ $t(tab.label) }}
                <span v-if="tab.id === 'list'" class="count">{{ shows.length }}</span>
            </button>
        </nav>

        <form v-if="activeTab === 'add'" class="show-form" @submit.prevent="submitShow">
            <h3>{{ $t('admin.show.formTitle') }}</h3>
            <div class="fields-grid">
                <label class="form-group">
                    <span>{{ $t('admin.show.movie') }}</span>
                    <select v-model="show.movieId" :disabled="movies.length === 0" required>
                        <option value="">
                            {{
                                movies.length === 0
                                    ? $t('admin.show.noMovies')
                                    : $t('admin.show.selectMovie')
                            }}
                        </option>
                        <option v-for="movie in movies" :key="movie.id" :value="movie.id">
                            {{ movie.name }}
                        </option>
                    </select>
                </label>
                <label class="form-group">
                    <span>{{ $t('admin.show.cinema') }}</span>
                    <select v-model="show.cinemaId" required>
                        <option value="">{{ $t('admin.show.selectCinema') }}</option>
                        <option v-for="cinema in cinemas" :key="cinema.id" :value="cinema.id">
                            {{ cinema.name }}
                        </option>
                    </select>
                </label>
                <label class="form-group">
                    <span>{{ $t('admin.show.date') }}</span>
                    <input v-model="show.date" type="date" required />
                </label>
                <label class="form-group">
                    <span>{{ $t('admin.show.time') }}</span>
                    <input v-model="show.time" type="time" required />
                </label>
                <label class="form-group">
                    <span>{{ $t('admin.show.venue') }}</span>
                    <select v-model="show.venueId" :disabled="!venueOptions.length" required>
                        <option value="">
                            {{
                                !show.cinemaId
                                    ? $t('admin.show.selectCinemaFirst')
                                    : $t('admin.show.selectVenue')
                            }}
                        </option>
                        <option v-for="venue in venueOptions" :key="venue.id" :value="venue.id">
                            {{ $t(`venueNames.${venue.id}`) }} · {{ venue.capacity }}
                            {{ $t('admin.show.seatCount') }}
                        </option>
                    </select>
                </label>
            </div>

            <fieldset class="pricing">
                <legend>{{ $t('admin.show.ticketPrices') }}</legend>
                <p>{{ $t('admin.show.ticketPricesHint') }}</p>
                <div class="fields-grid">
                    <label v-for="type in ticketTypes" :key="type" class="form-group">
                        <span>{{ $t(`ticket.${type.toLowerCase()}.label`) }} (€)</span>
                        <input
                            v-model.number="prices[type]"
                            type="number"
                            min="0"
                            max="1000"
                            step="0.01"
                            required
                        />
                    </label>
                </div>
            </fieldset>

            <div
                v-if="message"
                class="message"
                :class="{ error: messageType === 'error' }"
                role="status"
            >
                {{ message }}
            </div>
            <div v-if="loadError" class="message error" role="alert">{{ loadError }}</div>
            <button type="submit" :disabled="isSaving">
                {{ isSaving ? $t('admin.show.saving') : $t('admin.show.create') }}
            </button>
        </form>

        <div v-else class="show-list">
            <h3>{{ $t('admin.show.listTitle') }}</h3>
            <div v-if="loadError" class="message error" role="alert">{{ loadError }}</div>
            <p v-if="shows.length === 0" class="empty-state">{{ $t('admin.show.empty') }}</p>
            <article v-for="item in shows" :key="item.id" class="show-row">
                <div>
                    <strong>{{ item.movie_name }}</strong>
                    <p>
                        {{ item.cinema_name }}
                        <span v-if="item.venue_id"> · {{ $t(`venueNames.${item.venue_id}`) }}</span>
                        · {{ item.date }} {{ item.time }} · {{ item.seats }}
                        {{ $t('admin.show.availableSeats') }}
                    </p>
                    <p class="prices">
                        {{ $t('ticket.adult.label') }} €{{
                            (item.adult_price_cents / 100).toFixed(2)
                        }}
                        · {{ $t('ticket.student.label') }} €{{
                            (item.student_price_cents / 100).toFixed(2)
                        }}
                        · {{ $t('ticket.senior.label') }} €{{
                            (item.senior_price_cents / 100).toFixed(2)
                        }}
                        · {{ $t('ticket.child.label') }} €{{
                            (item.child_price_cents / 100).toFixed(2)
                        }}
                    </p>
                </div>
                <button type="button" class="button-danger" @click="deleteShow(item.id)">
                    {{ $t('admin.show.delete') }}
                </button>
            </article>
        </div>
    </section>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.ts';
import { DEFAULT_TICKET_PRICES_CENTS } from '@/data/tickets.ts';
import type { Cinema } from '@/types/cinema.ts';
import type { Movie } from '@/types/movie.ts';
import type { Show } from '@/types/show.ts';
import type { Venue } from '@/types/venue.ts';

const props = defineProps<{ initialMovieId?: number }>();
const { t } = useI18n();
const authStore = useAuthStore();
const API = 'http://localhost:3000/api';
const tabs = [
    { id: 'add', label: 'admin.show.addTab' },
    { id: 'list', label: 'admin.show.listTab' },
] as const;
const ticketTypes = ['Adult', 'Student', 'Senior', 'Child'] as const;
const activeTab = ref<(typeof tabs)[number]['id']>('add');
const movies = ref<Movie[]>([]);
const cinemas = ref<Cinema[]>([]);
const venues = ref<Venue[]>([]);
const shows = ref<Show[]>([]);
const isSaving = ref(false);
const loadError = ref('');
const message = ref('');
const messageType = ref<'success' | 'error'>('success');
const show = reactive({
    movieId: props.initialMovieId ?? '',
    cinemaId: '',
    venueId: '',
    date: '',
    time: '',
});
const venueOptions = computed(() =>
    venues.value.filter((venue) => venue.cinemaId === Number(show.cinemaId)),
);
const prices = ref({
    Adult: DEFAULT_TICKET_PRICES_CENTS.Adult / 100,
    Student: DEFAULT_TICKET_PRICES_CENTS.Student / 100,
    Senior: DEFAULT_TICKET_PRICES_CENTS.Senior / 100,
    Child: DEFAULT_TICKET_PRICES_CENTS.Child / 100,
});

watch(
    () => props.initialMovieId,
    (movieId) => {
        if (movieId) show.movieId = movieId;
    },
);

watch(
    () => show.cinemaId,
    () => {
        show.venueId = '';
    },
);

function authConfig() {
    return { headers: { Authorization: `Bearer ${authStore.token}` } };
}

function errorText(error: unknown, fallback: string) {
    if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.error;
        return typeof serverMessage === 'string' && serverMessage.trim()
            ? `${fallback} ${serverMessage}`
            : fallback;
    }
    return error instanceof Error ? error.message : fallback;
}

async function fetchData() {
    loadError.value = '';
    const [moviesResult, cinemasResult, showsResult, venuesResult] = await Promise.allSettled([
        axios.get<Movie[]>(`${API}/content/movies`),
        axios.get<Cinema[]>(`${API}/content/cinemas`),
        axios.get<Show[]>(`${API}/content/shows`),
        axios.get<Venue[]>(`${API}/content/venues`),
    ]);

    if (moviesResult.status === 'fulfilled') movies.value = moviesResult.value.data;
    if (cinemasResult.status === 'fulfilled') cinemas.value = cinemasResult.value.data;
    if (showsResult.status === 'fulfilled') shows.value = showsResult.value.data;
    if (venuesResult.status === 'fulfilled') venues.value = venuesResult.value.data;
    const errors: string[] = [];
    if (moviesResult.status === 'rejected')
        errors.push(errorText(moviesResult.reason, t('admin.show.loadMoviesError')));
    if (cinemasResult.status === 'rejected')
        errors.push(errorText(cinemasResult.reason, t('admin.show.loadCinemasError')));
    if (showsResult.status === 'rejected')
        errors.push(errorText(showsResult.reason, t('admin.show.loadShowsError')));
    if (venuesResult.status === 'rejected')
        errors.push(errorText(venuesResult.reason, t('admin.show.loadVenuesError')));
    loadError.value = errors.join(' ');
}

async function submitShow() {
    if (isSaving.value) return;
    if (
        Object.values(prices.value).some(
            (price) => !Number.isFinite(price) || price < 0 || price > 1000,
        )
    ) {
        messageType.value = 'error';
        message.value = t('admin.show.invalidPrice');
        return;
    }

    isSaving.value = true;
    message.value = '';
    try {
        await axios.post(
            `${API}/admin/shows`,
            {
                ...show,
                adult_price_cents: Math.round(prices.value.Adult * 100),
                student_price_cents: Math.round(prices.value.Student * 100),
                senior_price_cents: Math.round(prices.value.Senior * 100),
                child_price_cents: Math.round(prices.value.Child * 100),
            },
            authConfig(),
        );
        messageType.value = 'success';
        message.value = t('admin.show.created');
        show.cinemaId = '';
        show.venueId = '';
        show.date = '';
        show.time = '';
        prices.value = {
            Adult: DEFAULT_TICKET_PRICES_CENTS.Adult / 100,
            Student: DEFAULT_TICKET_PRICES_CENTS.Student / 100,
            Senior: DEFAULT_TICKET_PRICES_CENTS.Senior / 100,
            Child: DEFAULT_TICKET_PRICES_CENTS.Child / 100,
        };
        await fetchData();
    } catch (error) {
        messageType.value = 'error';
        message.value = errorText(error, t('admin.show.createError'));
    } finally {
        isSaving.value = false;
    }
}

async function deleteShow(id: number) {
    try {
        await axios.delete(`${API}/admin/shows/${id}`, authConfig());
        shows.value = shows.value.filter((item) => item.id !== id);
    } catch (error) {
        loadError.value = errorText(error, t('admin.show.deleteError'));
    }
}

onMounted(fetchData);
</script>

<style scoped>
.show-manager {
    max-width: 900px;
    color: #172033;
}

h2,
h3 {
    margin: 0 0 1rem;
}

.tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
    border-bottom: 1px solid #e4e9f0;
}

.tabs button {
    padding: 0.7rem 1rem;
    border: 0;
    border-bottom: 3px solid transparent;
    background: transparent;
    cursor: pointer;
}

.tabs button.active {
    border-bottom-color: #16845d;
    color: #126747;
}

.count {
    margin-left: 0.4rem;
    color: #657187;
}

.show-form,
.show-list {
    padding: 1.25rem;
    border: 1px solid #e4e9f0;
    border-radius: 0.75rem;
    background: #fff;
}

.fields-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.form-group {
    display: grid;
    gap: 0.4rem;
    margin-bottom: 0.9rem;
    font-weight: 600;
}

input,
select {
    width: 100%;
    min-height: 2.7rem;
    padding: 0.6rem 0.7rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.45rem;
}

.pricing {
    margin: 0.5rem 0 1rem;
    padding: 1rem;
    border: 1px solid #e4e9f0;
    border-radius: 0.6rem;
}

.pricing legend {
    padding: 0 0.4rem;
    font-weight: 700;
}

.pricing > p,
.show-row p {
    margin: 0.25rem 0 0.75rem;
    color: #657187;
    font-size: 0.88rem;
}

button[type='submit'],
.button-danger {
    padding: 0.65rem 0.9rem;
    border: 0;
    border-radius: 0.45rem;
    background: #16845d;
    color: #fff;
    cursor: pointer;
}

button:disabled {
    cursor: wait;
    opacity: 0.6;
}

.button-danger {
    background: #fff0f0;
    color: #b42318;
}

.message {
    margin: 0.8rem 0;
    padding: 0.7rem;
    border-radius: 0.45rem;
    background: #e8f5ef;
    color: #126747;
}

.message.error {
    background: #fff0f0;
    color: #b42318;
}

.show-list {
    display: grid;
    gap: 0.75rem;
}

.show-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem;
    border: 1px solid #e4e9f0;
    border-radius: 0.5rem;
}

.prices {
    color: #344054 !important;
}

.empty-state {
    color: #657187;
}

@media (max-width: 600px) {
    .fields-grid {
        grid-template-columns: 1fr;
    }

    .show-row {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>
