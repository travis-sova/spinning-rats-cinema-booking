import { defineStore } from 'pinia';
import axios from 'axios';

export const useContentStore = defineStore('content', {
    state: () => ({
        movies: [],
        shows: [],
        cinemas: [],
        loading: false,
        error: null,
    }),
    actions: {
        async fetchContent() {
            this.loading = true;
            this.error = null;
            try {
                const [moviesRes, showsRes, cinemasRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/content/movies'),
                    axios.get('http://localhost:3000/api/content/shows'),
                    axios.get('http://localhost:3000/api/content/cinemas'),
                ]);
                this.movies = moviesRes.data;
                this.shows = showsRes.data;
                this.cinemas = cinemasRes.data;
            } catch (error) {
                this.error = error.response?.data?.error || error.message;
            } finally {
                this.loading = false;
            }
        },
    },
});
