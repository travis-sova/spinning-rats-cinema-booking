<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import int from '@/assets/carousel/int.jpg';
import gvsk from '@/assets/carousel/gvsk.jpg';
import mk from '@/assets/carousel/mk.jpg';

const slides = [int, gvsk, mk];
const currentSlide = ref(1);

let interval: ReturnType<typeof setInterval> | undefined;

const startInterval = () => {
    clearInterval(interval);
    interval = setInterval(nextSlide, 3000);
};

const nextSlide = () => {
    currentSlide.value = (currentSlide.value + 1) % slides.length;
    const temp = slides.shift() || '';
    slides.push(temp);
    currentSlide.value = 1;
    startInterval(); // Reset interval when manually triggered
};

const prevSlide = () => {
    currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
    const temp = slides.pop() || '';
    slides.unshift(temp);
    currentSlide.value = 1;
    startInterval(); // Reset interval when manually triggered
};

onMounted(() => {
    startInterval();
});

onUnmounted(() => {
    clearInterval(interval);
});
</script>

<template>
    <div class="flex justify-center items-center h-full overflow-hidden">
        <div class="carousel-container relative w-3/4 h-full">
            <div
                class="flex transition-transform duration-500 ease-in-out"
                :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
            >
                <div
                    v-for="(slide, index) in slides"
                    :key="index"
                    :class="[
                        'w-full flex-shrink-0',
                        { blurred: Math.abs(currentSlide - index) === 1 },
                    ]"
                >
                    <img :src="slide" class="w-full h-full object-cover" />
                </div>
            </div>
            <div class="absolute inset-0 flex justify-between items-center">
                <button @click="prevSlide" class="btn btn-circle ml-2">❮</button>
                <button @click="nextSlide" class="btn btn-circle mr-2">❯</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.carousel-container {
    position: relative;
}

.blurred {
    filter: blur(10px);
    transition: filter 0.5s;
}

.transition-transform {
    transition: transform 0.5s ease-in-out;
}
</style>
