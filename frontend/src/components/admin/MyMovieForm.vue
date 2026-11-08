<template>
    <section class="movie-manager">
        <header class="manager-heading">
            <div>
                <p class="eyebrow">{{ $t('admin.movie.eyebrow') }}</p>
                <h2>{{ $t('admin.movie.title') }}</h2>
                <p>{{ $t('admin.movie.subtitle') }}</p>
            </div>
        </header>

        <nav class="tabs" :aria-label="$t('admin.movie.title')">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                :class="{ active: activeTab === tab.id }"
                @click="activeTab = tab.id"
            >
                {{ $t(tab.label) }}
                <span v-if="tab.id === 'list'" class="count">{{ movies.length }}</span>
            </button>
        </nav>

        <div v-if="activeTab === 'add'" class="form-layout">
            <form class="movie-form" @submit.prevent="submitMovie">
                <div class="section-heading">
                    <div>
                        <h3>
                            {{
                                $t(editingId === null ? 'admin.movie.details' : 'admin.movie.edit')
                            }}
                        </h3>
                        <p>{{ $t('admin.movie.requiredNote') }}</p>
                    </div>
                    <button
                        v-if="editingId !== null"
                        type="button"
                        class="button button-muted"
                        @click="resetForm"
                    >
                        {{ $t('admin.movie.cancelEdit') }}
                    </button>
                </div>

                <div class="poster-section">
                    <div class="poster-preview">
                        <img
                            v-if="posterPreview"
                            :src="posterPreview"
                            :alt="movie.name || $t('admin.movie.posterPreview')"
                        />
                        <div v-else class="poster-placeholder">
                            <span aria-hidden="true">▧</span>
                            <span>{{ $t('admin.movie.posterPreview') }}</span>
                        </div>
                    </div>
                    <div class="poster-fields">
                        <label class="field-label" for="poster-file">{{
                            $t('admin.movie.poster')
                        }}</label>
                        <input
                            id="poster-file"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            @change="selectPoster"
                        />
                        <p class="field-hint">{{ $t('admin.movie.posterHint') }}</p>
                        <label class="field-label" for="poster-url">{{
                            $t('admin.movie.posterUrl')
                        }}</label>
                        <input
                            id="poster-url"
                            v-model.trim="movie.img"
                            type="url"
                            maxlength="255"
                            :placeholder="$t('admin.movie.posterUrlPlaceholder')"
                            :required="!selectedPoster"
                            @input="clearSelectedPoster"
                        />
                    </div>
                </div>

                <div class="fields-grid">
                    <label class="field">
                        <span class="field-label">{{ $t('admin.movie.name') }} *</span>
                        <input v-model.trim="movie.name" type="text" maxlength="255" required />
                    </label>
                    <label class="field">
                        <span class="field-label">{{ $t('admin.movie.genre') }} *</span>
                        <input
                            v-model.trim="movie.genre"
                            type="text"
                            maxlength="255"
                            :placeholder="$t('admin.movie.genrePlaceholder')"
                            required
                        />
                    </label>
                    <label class="field field-wide">
                        <span class="field-label">{{ $t('admin.movie.description') }} *</span>
                        <textarea
                            v-model.trim="movie.description"
                            maxlength="1000"
                            rows="5"
                            required
                        ></textarea>
                    </label>
                    <label class="field">
                        <span class="field-label">{{ $t('admin.movie.rating') }} *</span>
                        <input
                            v-model.number="movie.rating"
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            required
                        />
                    </label>
                </div>

                <div v-if="formMessage" class="notice" :class="formMessageType" role="status">
                    {{ formMessage }}
                </div>

                <div class="form-actions">
                    <button type="submit" class="button button-primary" :disabled="isSaving">
                        {{
                            isSaving
                                ? $t('admin.movie.saving')
                                : $t(editingId === null ? 'admin.movie.add' : 'admin.movie.save')
                        }}
                    </button>
                    <span v-if="isSaving" class="saving-note">{{
                        $t('admin.movie.savingHint')
                    }}</span>
                </div>
            </form>

            <aside class="form-aside">
                <h3>{{ $t('admin.movie.asideTitle') }}</h3>
                <p>
                    {{ $t('admin.movie.asideText') }}
                </p>
            </aside>
        </div>

        <div v-else class="movie-list">
            <div v-if="listError" class="notice error" role="alert">{{ listError }}</div>
            <div v-if="movies.length === 0" class="empty-state">{{ $t('admin.movie.empty') }}</div>
            <article v-for="item in movies" :key="item.id" class="movie-row">
                <img :src="item.img" :alt="item.name" class="movie-poster" />
                <div class="movie-summary">
                    <h3>{{ item.name }}</h3>
                    <p>{{ item.genre }} · {{ $t('admin.movie.rating') }} {{ item.rating }}/100</p>
                </div>
                <div class="row-actions">
                    <button
                        type="button"
                        class="button button-primary"
                        @click="$emit('schedule-movie', item.id)"
                    >
                        {{ $t('admin.movie.schedule') }}
                    </button>
                    <button type="button" class="button button-muted" @click="editMovie(item)">
                        {{ $t('admin.movie.edit') }}
                    </button>
                    <button
                        type="button"
                        class="button button-danger"
                        :disabled="deletingId === item.id"
                        @click="deleteMovie(item.id)"
                    >
                        {{
                            deletingId === item.id
                                ? $t('admin.movie.deleting')
                                : $t('admin.movie.delete')
                        }}
                    </button>
                </div>
            </article>
        </div>
    </section>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.ts';
import type { Movie } from '@/types/movie.ts';

type MovieDraft = Pick<Movie, 'img' | 'name' | 'genre' | 'description' | 'rating'>;

defineEmits<{
    'schedule-movie': [movieId: number];
}>();

const API = 'http://localhost:3000/api';
const { t } = useI18n();
const authStore = useAuthStore();
const tabs = [
    { id: 'add', label: 'admin.movie.addTab' },
    { id: 'list', label: 'admin.movie.listTab' },
] as const;
const activeTab = ref<(typeof tabs)[number]['id']>('add');
const movies = ref<Movie[]>([]);
const editingId = ref<number | null>(null);
const deletingId = ref<number | null>(null);
const isSaving = ref(false);
const listError = ref('');
const formMessage = ref('');
const formMessageType = ref<'success' | 'error'>('success');
const selectedPoster = ref<File | null>(null);
const localPosterPreview = ref('');

const emptyMovie = (): MovieDraft => ({
    img: '',
    name: '',
    genre: '',
    description: '',
    rating: 0,
});
const movie = ref<MovieDraft>(emptyMovie());
const posterPreview = computed(() => localPosterPreview.value || movie.value.img);

function authConfig() {
    return { headers: { Authorization: `Bearer ${authStore.token}` } };
}

function errorText(error: unknown, fallback: string) {
    if (axios.isAxiosError(error)) return fallback;
    return error instanceof Error ? error.message : fallback;
}

watch(selectedPoster, (file) => {
    if (localPosterPreview.value) URL.revokeObjectURL(localPosterPreview.value);
    localPosterPreview.value = file ? URL.createObjectURL(file) : '';
});

onBeforeUnmount(() => {
    if (localPosterPreview.value) URL.revokeObjectURL(localPosterPreview.value);
});

function selectPoster(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > 5 * 1024 * 1024
    ) {
        selectedPoster.value = null;
        formMessageType.value = 'error';
        formMessage.value = t('admin.movie.invalidPoster');
        input.value = '';
        return;
    }
    formMessage.value = '';
    selectedPoster.value = file;
}

function clearSelectedPoster() {
    selectedPoster.value = null;
}

function resetForm() {
    movie.value = emptyMovie();
    editingId.value = null;
    selectedPoster.value = null;
    formMessage.value = '';
    formMessageType.value = 'success';
}

function editMovie(item: Movie) {
    movie.value = {
        img: item.img || '',
        name: item.name,
        genre: item.genre,
        description: item.description,
        rating: item.rating,
    };
    editingId.value = item.id;
    selectedPoster.value = null;
    formMessage.value = '';
    activeTab.value = 'add';
}

async function fetchMovies() {
    listError.value = '';
    try {
        const response = await axios.get<Movie[]>(`${API}/content/movies`, authConfig());
        movies.value = response.data;
    } catch (error) {
        listError.value = errorText(error, t('admin.movie.loadError'));
    }
}

async function submitMovie() {
    if (isSaving.value) return;
    const isEditing = editingId.value !== null;
    isSaving.value = true;
    formMessage.value = '';
    let uploadedImage = '';
    try {
        if (selectedPoster.value) {
            const response = await axios.post<{ img: string }>(
                `${API}/admin/movies/poster`,
                selectedPoster.value,
                {
                    ...authConfig(),
                    headers: {
                        ...authConfig().headers,
                        'Content-Type': selectedPoster.value.type,
                    },
                },
            );
            uploadedImage = response.data.img;
        }

        const payload = { ...movie.value, img: uploadedImage || movie.value.img };
        if (editingId.value === null) {
            await axios.post(`${API}/admin/movies`, payload, authConfig());
        } else {
            await axios.put(`${API}/admin/movies/${editingId.value}`, payload, authConfig());
        }

        uploadedImage = '';
        resetForm();
        formMessageType.value = 'success';
        formMessage.value = t(isEditing ? 'admin.movie.updated' : 'admin.movie.added');
        await fetchMovies();
    } catch (error) {
        if (uploadedImage) {
            try {
                await axios.delete(`${API}/admin/movies/poster`, {
                    ...authConfig(),
                    data: { img: uploadedImage },
                });
            } catch (cleanupError) {
                console.error('Failed to clean up an unused movie poster:', cleanupError);
            }
        }
        formMessageType.value = 'error';
        formMessage.value = errorText(error, t('admin.movie.saveError'));
    } finally {
        isSaving.value = false;
    }
}

async function deleteMovie(id: number) {
    deletingId.value = id;
    listError.value = '';
    try {
        await axios.delete(`${API}/admin/movies/${id}`, authConfig());
        movies.value = movies.value.filter((item) => item.id !== id);
    } catch (error) {
        listError.value = errorText(error, t('admin.movie.deleteError'));
    } finally {
        deletingId.value = null;
    }
}

onMounted(fetchMovies);
</script>

<style scoped>
.movie-manager {
    color: #172033;
}

.manager-heading {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.5rem;
}

.manager-heading h2 {
    margin: 0.1rem 0 0.4rem;
    font-size: 1.5rem;
    font-weight: 700;
}

.manager-heading p,
.section-heading p,
.form-aside p {
    margin: 0;
    color: #657187;
}

.eyebrow {
    color: #16845d !important;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
}

.tabs {
    display: flex;
    gap: 0.5rem;
    border-bottom: 1px solid #e4e9f0;
    margin-bottom: 1.5rem;
}

.tabs button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 0;
    border-bottom: 3px solid transparent;
    background: transparent;
    color: #657187;
    cursor: pointer;
    font-weight: 600;
}

.tabs button.active {
    border-bottom-color: #16845d;
    color: #126747;
}

.count {
    min-width: 1.4rem;
    padding: 0.1rem 0.35rem;
    border-radius: 999px;
    background: #e8f5ef;
    text-align: center;
    font-size: 0.75rem;
}

.form-layout {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(220px, 0.8fr);
    align-items: start;
    gap: 1.25rem;
}

.movie-form,
.form-aside,
.movie-row {
    border: 1px solid #e4e9f0;
    border-radius: 0.85rem;
    background: #fff;
    box-shadow: 0 8px 25px rgb(23 32 51 / 5%);
}

.movie-form {
    padding: 1.5rem;
}

.section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
}

.section-heading h3,
.form-aside h3 {
    margin: 0 0 0.3rem;
    font-size: 1.1rem;
    font-weight: 700;
}

.poster-section {
    display: grid;
    grid-template-columns: 130px minmax(0, 1fr);
    gap: 1.25rem;
    align-items: center;
    margin-bottom: 1.25rem;
    padding: 1rem;
    border: 1px dashed #cbd5e1;
    border-radius: 0.75rem;
    background: #f8fafc;
}

.poster-preview {
    width: 130px;
    height: 170px;
    overflow: hidden;
    border-radius: 0.55rem;
    background: #e8edf3;
}

.poster-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.poster-placeholder {
    display: flex;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: #7a8799;
    font-size: 0.8rem;
}

.poster-placeholder span:first-child {
    font-size: 2rem;
}

.poster-fields {
    display: grid;
    gap: 0.55rem;
}

.fields-grid,
.price-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.field {
    display: grid;
    gap: 0.4rem;
}

.field-wide {
    grid-column: 1 / -1;
}

.field-label {
    color: #344054;
    font-size: 0.85rem;
    font-weight: 650;
}

.field input,
.field textarea,
.poster-fields input:not([type='file']) {
    width: 100%;
    min-height: 2.7rem;
    padding: 0.65rem 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    background: #fff;
    color: #172033;
}

.field textarea {
    resize: vertical;
}

input:focus,
textarea:focus {
    border-color: #16845d;
    outline: 3px solid rgb(22 132 93 / 12%);
}

.field-hint {
    margin: 0 0 0.2rem;
    color: #7a8799;
    font-size: 0.75rem;
}

.pricing {
    margin: 1.5rem 0 0;
    padding: 1rem;
    border: 1px solid #e4e9f0;
    border-radius: 0.7rem;
}

.pricing legend {
    padding: 0 0.4rem;
    font-weight: 700;
}

.pricing > p {
    margin: 0 0 1rem;
    font-size: 0.85rem;
}

.form-actions,
.row-actions {
    display: flex;
    align-items: center;
    gap: 0.65rem;
}

.form-actions {
    margin-top: 1.25rem;
}

.saving-note {
    color: #657187;
    font-size: 0.8rem;
}

.button {
    padding: 0.65rem 0.9rem;
    border: 0;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 650;
}

.button:disabled {
    cursor: wait;
    opacity: 0.65;
}

.button-primary {
    background: #16845d;
    color: #fff;
}

.button-muted {
    background: #edf1f5;
    color: #344054;
}

.button-danger {
    background: #fff0f0;
    color: #b42318;
}

.form-aside {
    padding: 1.25rem;
    background: linear-gradient(150deg, #f1fbf6, #fff);
}

.aside-tip {
    display: grid;
    gap: 0.3rem;
    margin-top: 1.25rem;
    padding: 0.9rem;
    border-radius: 0.6rem;
    background: #e2f4eb;
    color: #245c45;
    font-size: 0.85rem;
}

.notice {
    margin-top: 1rem;
    padding: 0.75rem 0.9rem;
    border-radius: 0.5rem;
}

.notice.success {
    background: #e8f5ef;
    color: #126747;
}

.notice.error {
    background: #fff0f0;
    color: #b42318;
}

.movie-list {
    display: grid;
    gap: 0.75rem;
}

.movie-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.85rem;
}

.movie-poster {
    width: 56px;
    height: 76px;
    flex: 0 0 auto;
    border-radius: 0.4rem;
    background: #e8edf3;
    object-fit: cover;
}

.movie-summary {
    min-width: 0;
    flex: 1;
}

.movie-summary h3 {
    margin: 0 0 0.2rem;
    font-weight: 700;
}

.movie-summary p {
    margin: 0.15rem 0;
    color: #657187;
    font-size: 0.82rem;
}

.empty-state {
    padding: 2rem;
    border: 1px dashed #cbd5e1;
    border-radius: 0.75rem;
    color: #657187;
    text-align: center;
}

@media (max-width: 800px) {
    .form-layout {
        grid-template-columns: 1fr;
    }

    .form-aside {
        order: -1;
    }
}

@media (max-width: 560px) {
    .poster-section {
        grid-template-columns: 1fr;
    }

    .fields-grid,
    .price-grid {
        grid-template-columns: 1fr;
    }

    .movie-row {
        flex-wrap: wrap;
    }

    .row-actions {
        width: 100%;
        justify-content: flex-end;
    }
}
</style>
