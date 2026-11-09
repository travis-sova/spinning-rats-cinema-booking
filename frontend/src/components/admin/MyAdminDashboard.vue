<template>
    <div class="admin-dashboard">
        <h1>{{ $t('admin.dashboard.title') }}</h1>

        <div class="stats">
            <div class="stat-card" v-for="stat in stats" :key="stat.name">
                <h3>{{ $t(stat.name) }}</h3>
                <p>{{ stat.value }}</p>
            </div>
        </div>

        <div class="admin-tabs">
            <button
                v-for="tab in tabs"
                :key="tab"
                @click="setActiveTab(tab)"
                :class="{ active: activeTab === tab }"
            >
                {{ $t(`admin.dashboard.tabs.${tab.toLowerCase()}`) }}
            </button>
        </div>

        <div class="tab-content" style="display: block">
            <UserManagement v-if="activeTab === 'Users'" />
            <MovieForm v-if="activeTab === 'Movies'" @schedule-movie="scheduleMovie" />
            <ShowForm v-if="activeTab === 'Shows'" :initial-movie-id="scheduledMovieId" />
        </div>
    </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.ts';
import UserManagement from './MyUserManagement.vue';
import MovieForm from './MyMovieForm.vue';
import ShowForm from './MyShowForm.vue';

import type { Tab } from '@/types/tab.ts';

export default {
    components: { UserManagement, MovieForm, ShowForm },
    setup() {
        const authStore = useAuthStore();
        const stats = ref([
            { name: 'admin.dashboard.stats.movies', value: 0 },
            { name: 'admin.dashboard.stats.shows', value: 0 },
            { name: 'admin.dashboard.stats.users', value: 0 },
        ]);

        const tabs: Tab[] = ['Users', 'Movies', 'Shows'] as const;
        const activeTab = ref<Tab>('Users');
        const scheduledMovieId = ref<number>();

        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/admin/stats', {
                    headers: { Authorization: `Bearer ${authStore.token}` },
                });
                stats.value = [
                    { name: 'admin.dashboard.stats.movies', value: response.data.movies },
                    { name: 'admin.dashboard.stats.shows', value: response.data.shows },
                    { name: 'admin.dashboard.stats.users', value: response.data.users },
                ];
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        const setActiveTab = (tab: Tab) => {
            activeTab.value = tab;
        };

        const scheduleMovie = (movieId: number) => {
            scheduledMovieId.value = movieId;
            activeTab.value = 'Shows';
        };

        onMounted(fetchStats);

        return { stats, tabs, activeTab, setActiveTab, scheduledMovieId, scheduleMovie };
    },
};
</script>

<style scoped>
.admin-dashboard {
    padding: 20px;
}

.stats {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 8px;
    min-width: 100px;
    text-align: center;
}

.admin-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.admin-tabs button {
    padding: 10px 20px;
    background: #eee;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.admin-tabs button.active {
    background: #42b983;
    color: white;
}

.tab-content {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
