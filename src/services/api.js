import axios from 'axios';
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '@env';

// Validate that API key is set
if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
  console.warn(
    '⚠️  TMDB API key not configured!\n' +
    'Please set your TMDB_API_KEY in the .env file.\n' +
    'Get your API key from: https://www.themoviedb.org/settings/api'
  );
}

// Create axios instance for TMDB API
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

// API endpoints
export const movieEndpoints = {
  popular: '/movie/popular',
  topRated: '/movie/top_rated',
  nowPlaying: '/movie/now_playing',
  upcoming: '/movie/upcoming',
  search: '/search/movie',
  details: (movieId) => `/movie/${movieId}`,
  credits: (movieId) => `/movie/${movieId}/credits`,
  similar: (movieId) => `/movie/${movieId}/similar`,
  videos: (movieId) => `/movie/${movieId}/videos`,
};

// Image URL helpers
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// API request functions
export const getPopularMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get(movieEndpoints.popular, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

export const getTopRatedMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get(movieEndpoints.topRated, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    throw error;
  }
};

export const getNowPlayingMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get(movieEndpoints.nowPlaying, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    throw error;
  }
};

export const searchMovies = async (query, page = 1) => {
  try {
    const response = await tmdbApi.get(movieEndpoints.search, {
      params: { query, page }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

export const getMovieDetails = async (movieId) => {
  try {
    const response = await tmdbApi.get(movieEndpoints.details(movieId));
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

export const getMovieCredits = async (movieId) => {
  try {
    const response = await tmdbApi.get(movieEndpoints.credits(movieId));
    return response.data;
  } catch (error) {
    console.error('Error fetching movie credits:', error);
    throw error;
  }
};

export const getSimilarMovies = async (movieId, page = 1) => {
  try {
    const response = await tmdbApi.get(movieEndpoints.similar(movieId), {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    throw error;
  }
};

export const getMovieVideos = async (movieId) => {
  try {
    const response = await tmdbApi.get(movieEndpoints.videos(movieId));
    return response.data;
  } catch (error) {
    console.error('Error fetching movie videos:', error);
    throw error;
  }
};

export default tmdbApi;