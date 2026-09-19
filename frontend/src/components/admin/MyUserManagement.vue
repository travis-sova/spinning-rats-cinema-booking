<template>
    <div class="user-management">
        <p>User Management Component</p>
        <table>
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user.id">
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.perms === 1 ? 'Admin' : 'User' }}</td>
                    <td>
                        <button
                            @click="toggleAdminStatus(user.id, user.perms)"
                            :class="user.perms === 1 ? 'revoke' : 'grant'"
                        >
                            {{ user.perms === 1 ? 'Revoke Admin' : 'Make Admin' }}
                        </button>
                        <button @click="deleteUser(user.id)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.ts';

import type { User } from '@/types/user.ts';

export default {
    setup() {
        const authStore = useAuthStore();
        const users = ref<User[]>([]);

        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/admin/users', {
                    headers: { Authorization: `Bearer ${authStore.token}` },
                });
                users.value = response.data;
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        const toggleAdminStatus = async (userId: number, currentStatus: number) => {
            try {
                const newStatus = currentStatus === 1 ? 0 : 1;
                await axios.patch(
                    `http://localhost:3000/api/admin/users/${userId}/permissions`,
                    { perms: newStatus },
                    { headers: { Authorization: `Bearer ${authStore.token}` } },
                );
                fetchUsers();
            } catch (error) {
                console.error('Failed to update user:', error);
            }
        };

        const deleteUser = async (id: number) => {
            try {
                await axios.delete(`http://localhost:3000/api/admin/users/${id}`, {
                    headers: { Authorization: `Bearer ${authStore.token}` },
                });
                users.value = users.value.filter((user) => user.id !== id);
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        };

        onMounted(fetchUsers);

        return { users, toggleAdminStatus, deleteUser };
    },
};
</script>

<style scoped>
table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

button {
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button.grant {
    background-color: #42b983;
    color: white;
}

button.revoke {
    background-color: #ff5252;
    color: white;
}
</style>
