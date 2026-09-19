<template>
    <div class="admin-view">
        <AdminDashboard />
    </div>
</template>

<script lang="ts">
import AdminDashboard from '@/components/admin/MyAdminDashboard.vue';

export default {
    name: 'AdminView',
    components: { AdminDashboard },
};
</script>

<style scoped>
.admin-view {
    padding: 20px;
}
</style>
