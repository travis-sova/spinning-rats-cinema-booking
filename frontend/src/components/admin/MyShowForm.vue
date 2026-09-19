<template>
    <div class="show-form">
        <h2>Show Management</h2>

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
            <!-- Add Show Form -->
            <div v-if="activeTab === 'Add Show'">
                <h2>Add New Show</h2>
                <form @submit.prevent="submitShow">
                    <div class="form-group">
                        <label>Movie</label>
                        <select v-model="show.movieId" required>
                            <option value="">Select a movie</option>
                            <option v-for="movie in movies" :key="movie.id" :value="movie.id">
                                {{ movie.name }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Cinema</label>
                        <select v-model="show.cinemaId" required>
                            <option value="">Select a cinema</option>
                            <option v-for="cinema in cinemas" :key="cinema.id" :value="cinema.id">
                                {{ cinema.name }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date</label>
                        <input v-model="show.date" type="date" required />
                    </div>
                    <div class="form-group">
                        <label>Time</label>
                        <input v-model="show.time" type="time" required />
                    </div>
                    <div class="form-group">
                        <label>Available Seats</label>
                        <input v-model.number="show.seats" type="number" min="1" required />
                    </div>
                    <button type="submit">Create Show</button>
                    <div v-if="message" class="message">{{ message }}</div>
                </form>
            </div>

            <!-- Show List -->
            <div v-if="activeTab === 'Show List'">
                <h2>Show List</h2>
                <ul>
                    <li v-for="show in shows" :key="show.id">
                        <strong>{{ show.movie_name }}</strong> at {{ show.cinema_name }} on
                        {{ show.date }} at {{ show.time }} seats: {{ show.seats }}
                        <button @click="deleteShow(show.id)">Delete</button>
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
import type { Cinema } from '@/types/cinema.ts';
import type { Show } from '@/types/show.ts';

export default {
    setup() {
        const authStore = useAuthStore();
        const show = ref({
            movieId: '',
            cinemaId: '',
            date: '',
            time: '',
            seats: 100,
        });
        const movies = ref<Movie[]>([]);
        const cinemas = ref<Cinema[]>([]);
        const message = ref('');
        const shows = ref<Show[]>([]);

        // Tabs
        const tabs = ['Add Show', 'Show List'];
        const activeTab = ref('Add Show');

        const setActiveTab = (tab: string) => {
            activeTab.value = tab;
        };

        const fetchData = async () => {
            try {
                const [moviesRes, cinemasRes, showsRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/content/movies'),
                    axios.get('http://localhost:3000/api/content/cinemas'),
                    axios.get('http://localhost:3000/api/content/shows'),
                ]);
                movies.value = moviesRes.data;
                cinemas.value = cinemasRes.data;
                shows.value = showsRes.data;
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        const submitShow = async () => {
            try {
                await axios.post('http://localhost:3000/api/admin/shows', show.value, {
                    headers: { Authorization: `Bearer ${authStore.token}` },
                });
                message.value = 'Show created successfully!';
                // Reset form
                show.value = {
                    movieId: '',
                    cinemaId: '',
                    date: '',
                    time: '',
                    seats: 100,
                };
                setTimeout(() => (message.value = ''), 3000);
                fetchData();
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    message.value =
                        'Failed to create show: ' + (error.response?.data?.error || error.message);
                } else {
                    message.value =
                        'Failed to create show: ' +
                        (error instanceof Error ? error.message : 'Unknown error');
                }
            }
        };

        const deleteShow = async (id: number) => {
            try {
                await axios.delete(`http://localhost:3000/api/admin/shows/${id}`, {
                    headers: { Authorization: `Bearer ${authStore.token}` },
                });
                shows.value = shows.value.filter((show) => show.id !== id);
            } catch (error) {
                console.error('Failed to delete show:', error);
            }
        };

        onMounted(fetchData);

        return {
            tabs,
            activeTab,
            setActiveTab,
            show,
            message,
            movies,
            cinemas,
            shows,
            submitShow,
            deleteShow,
        };
    },
};
</script>

<style scoped>
.show-form {
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

select,
input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    background: #42b983;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background: #369f6b;
}

.message {
    margin-top: 15px;
    padding: 10px;
    border-radius: 4px;
}

ul {
    list-style: none;
    padding: 0;
}

li {
    margin-bottom: 10px;
}
</style>
