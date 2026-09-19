<script setup lang="ts">
import news from '@/data/news';
</script>

<template>
    <div class="p-6">
        <h1 class="text-3xl font-bold text-center mb-6">{{ $t('news.latest') }}</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
                v-for="article in news"
                :key="article.id"
                class="card bg-base-100 shadow-xl transition-transform transform hover:scale-105 animate-fadeIn border border-gray-600 rounded-lg overflow-hidden"
            >
                <figure>
                    <img :src="article.image" alt="News Image" class="w-full h-48 object-cover" />
                </figure>
                <div class="card-body">
                    <h2 class="card-title">{{ $t(article.title) }}</h2>
                    <p>{{ $t(article.description) }}</p>
                    <div class="card-actions justify-end">
                        <router-link
                            :to="'/News/' + article.id"
                            class="btn btn-accent text-primary-content"
                            >{{ $t('news.more') }}</router-link
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
