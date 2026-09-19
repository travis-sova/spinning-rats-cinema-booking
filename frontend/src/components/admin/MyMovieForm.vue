<template>
    <div class="movie-form">
        <h2>Movie Management</h2>

        <!-- Tabs Section -->
        <div class="tabs">
            <button
                v-for="tab in tabs"
                :key="tab"
                @click="setActiveTab(tab)"
                :class="{ active: activeTab === tab }"
            >
                {{ tab }}
            </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content" style="display: block">
            <div v-if="activeTab === 'Add Movie'">
                <h3>Add New Movie</h3>
                <form @submit.prevent="submitMovie">
                    <div class="form-group">
                        <label>Poster URL</label>
                        <input v-model="movie.img" type="text" required />
                    </div>
                    <div class="form-group">
                        <label>Movie Title</label>
                        <input v-model="movie.name" type="text" required />
                    </div>
                    <div class="form-group">
                        <label>Genre</label>
                        <input v-model="movie.genre" type="text" required />
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea v-model="movie.description" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Rating (0-100)</label>
                        <input
                            v-model.number="movie.rating"
                            type="number"
                            min="0"
                            max="100"
                            required
                        />
                    </div>
                    <button type="submit">Add Movie</button>
                    <div v-if="message" class="message">{{ message }}</div>
                </form>
            </div>

            <!-- Movie List -->
            <div v-if="activeTab === 'Movie List'">
                <h3>Movie List</h3>
                <ul>
                    <li v-for="movie in movies" :key="movie.id">
                        <strong>{{ movie.name }}</strong> ({{ movie.genre }})
                        <button @click="deleteMovie(movie.id)">Delete</button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.ts';

import type { Movie } from '@/types/movie.ts';

export default {
    setup() {
        const authStore = useAuthStore();

        // Tabs
        const tabs = ['Add Movie', 'Movie List'];
        const activeTab = ref('Add Movie');

        const setActiveTab = (tab: string) => {
            activeTab.value = tab;
        };

        // Movie Form
        const movie = ref({
            img: '',
            name: '',
            genre: '',
            description: '',
            rating: 0,
        });
        const message = ref('');

        const submitMovie = async () => {
            try {
                await axios.post('http://localhost:3000/api/admin/movies', movie.value, {
                    headers: { Authorization: `Bearer ${authStore.token}` },
                });
                message.value = 'Movie added successfully!';
                movie.value = {
                    img: '',
                    name: '',
                    genre: '',
                    description: '',
                    rating: 0,
                };
                setTimeout(() => (message.value = ''), 3000);
                fetchMovies();
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    message.value =
                        'Failed to add movie: ' + (error.response?.data?.error || error.message);
                } else {
                    message.value =
                        'Failed to add movie: ' +
                        (error instanceof Error ? error.message : 'Unknown error');
                }
            }
        };

        // Movie List
        const movies = ref<Movie[]>([]);

        const fetchMovies = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/content/movies', {
                    headers: { Authorization: `Bearer ${authStore.token}` },
                });
                movies.value = response.data;
            } catch (error) {
                console.error('Failed to fetch movies:', error);
            }
        };

        const deleteMovie = async (id: number) => {
            try {
                await axios.delete(`http://localhost:3000/api/admin/movies/${id}`, {
                    headers: { Authorization: `Bearer ${authStore.token}` },
                });
                movies.value = movies.value.filter((movie) => movie.id !== id);
            } catch (error) {
                console.error('Failed to delete movie:', error);
            }
        };

        onMounted(fetchMovies);

        return {
            tabs,
            activeTab,
            setActiveTab,
            movie,
            message,
            submitMovie,
            movies,
            deleteMovie,
        };
    },
};
</script>

<style scoped>
.movie-form {
    max-width: 600px;
}

.tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.tabs button {
    padding: 10px 15px;
    border: none;
    background: #ddd;
    cursor: pointer;
    border-radius: 4px;
}

.tabs button.active {
    background: #42b983;
    color: white;
}

.tab-content {
    margin-top: 20px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

input,
textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

textarea {
    min-height: 100px;
}

button {
    background: #42b983;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.message {
    margin-top: 15px;
    padding: 10px;
    border-radius: 4px;
}

.message.success {
    background: #dff0d8;
    color: #3c763d;
}

.message.error {
    background: #f2dede;
    color: #a94442;
}
</style>
