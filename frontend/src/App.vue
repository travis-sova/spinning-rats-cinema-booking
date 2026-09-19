<script setup lang="ts">
import MyNavbar from '@/components/dashboard/MyNavbar.vue';
import MyFooter from '@/components/dashboard/MyFooter.vue';
</script>

<template>
    <MyNavbar />
    <router-view class="min-h-screen" />
    <MyFooter class="top-100" />
</template>

<style scoped></style>
