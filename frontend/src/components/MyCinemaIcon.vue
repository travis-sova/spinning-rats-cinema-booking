<template>
    <button
        :style="{
            top: cinema.position.top,
            left: cinema.position.left,
            width: `${baseSize * iconScale}px`,
            height: `${baseSize * iconScale}px`,
            fontSize: `${baseFontSize * iconScale}px`,
        }"
        class="cinema-icon absolute bg-red-500 hover:bg-red-700 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:scale-125 animate-fadeIn flex items-center justify-center"
        @click="$emit('selectCinema', cinema)"
    >
        🎥
    </button>
</template>

<script lang="ts">
export default {
    props: {
        cinema: { type: Object, required: true },
    },
    data() {
        return {
            iconScale: 1,
            baseSize: 40,
            baseFontSize: 16,
        };
    },
    created() {
        this.updateIconScale();
        window.addEventListener('resize', this.updateIconScale);
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.updateIconScale);
    },
    methods: {
        updateIconScale() {
            const baseScreenWidth = 1920;
            // Minimum Scale to prevent icons from becoming too small
            const minScale = 0.6;
            this.iconScale = Math.max(minScale, Math.min(1, window.innerWidth / baseScreenWidth));
        },
    },
};
</script>
