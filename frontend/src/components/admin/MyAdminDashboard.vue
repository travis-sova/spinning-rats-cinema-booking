<template>
    <div class="admin-dashboard">
        <h1>Admin Dashboard</h1>

        <div class="stats">
            <div class="stat-card" v-for="stat in stats" :key="stat.name">
                <h3>{{ stat.name }}</h3>
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
                {{ tab }}
            </button>
        </div>

        <div class="tab-content" style="display: block">
            <UserManagement v-if="activeTab === 'Users'" />
            <MovieForm v-if="activeTab === 'Movies'" />
            <ShowForm v-if="activeTab === 'Shows'" />
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
            { name: 'Movies', value: 0 },
            { name: 'Shows', value: 0 },
            { name: 'Users', value: 0 },
        ]);

        const tabs: Tab[] = ['Users', 'Movies', 'Shows'] as const;
        const activeTab = ref<Tab>('Users');

        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/admin/stats', {
                    headers: { Authorization: `Bearer ${authStore.token}` },
                });
                stats.value = [
                    { name: 'Movies', value: response.data.movies },
                    { name: 'Shows', value: response.data.shows },
                    { name: 'Users', value: response.data.users },
                ];
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        const setActiveTab = (tab: Tab) => {
            activeTab.value = tab;
        };

        onMounted(fetchStats);

        return { stats, tabs, activeTab, setActiveTab };
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
