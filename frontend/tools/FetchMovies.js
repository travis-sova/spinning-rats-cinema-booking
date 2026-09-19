// Fetches movie data from TMDb for refreshing backend/DUMP/dump.sql.
// Outputs movies.js for manual conversion to SQL; does not update the database.

import axios from 'axios';
import fs from 'fs';

// Untrivial to remove :-)
const TMDB = '42faa6b077f3a3a3e8aa667eadcc8ee1';
const MOVIES_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB}&language=en-US&page=1`;
const GENRES_URL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB}&language=en-US`;

// Fetch genres to map genre IDs to names
async function fetchGenres() {
  const response = await axios.get(GENRES_URL);
  const genres = response.data.genres;
  const genreMap = {};
  genres.forEach(genre => {
    genreMap[genre.id] = genre.name;
  });
  return genreMap;
}

// Fetch movies and generate the required structure
async function fetchMovies() {
  const genreMap = await fetchGenres();
  const response = await axios.get(MOVIES_URL);
  const movies = response.data.results.map((movie, index) => ({
    id: index + 1,
    img: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    name: movie.title,
    genre: genreMap[movie.genre_ids[0]] || 'Unknown', // Map genre ID to name
    description: movie.overview,
    seats: Math.floor(Math.random() * 100) + 1, // Random number of seats
    rating: Math.floor(movie.vote_average * 10), // Convert to percentage
  }));

  fs.writeFileSync('movies.js', `export default ${JSON.stringify(movies, null, 2)};`);
  console.log('Movies data fetched and saved to movies.js');
}

fetchMovies().catch(error => {
  console.error('Error fetching data from TMDb:', error);
});