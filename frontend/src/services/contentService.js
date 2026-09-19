import axios from 'axios';

const API_URL = 'http://localhost:3000/api/content';

export default {
    async getMovies() {
        const response = await axios.get(`${API_URL}/movies`);
        return response.data;
    },
    async getShows() {
        const response = await axios.get(`${API_URL}/shows`);
        return response.data;
    },
    async getCinemas() {
        const response = await axios.get(`${API_URL}/cinemas`);
        return response.data;
    },
};
