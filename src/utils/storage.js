import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  WATCHED_MOVIES: 'watched_movies',
  REVIEWS: 'movie_reviews',
  FAVORITES: 'favorite_movies',
};

// Movie data structure
export const createMovieData = (movie) => ({
  id: movie.id,
  title: movie.title,
  poster_path: movie.poster_path,
  release_date: movie.release_date,
  vote_average: movie.vote_average,
  watched_date: new Date().toISOString(),
  genres: movie.genres || [],
});

// Review data structure
export const createReviewData = (movieId, review) => ({
  id: `${movieId}_${Date.now()}`,
  movieId,
  rating: review.rating,
  comment: review.comment,
  date: new Date().toISOString(),
});

// Storage functions for watched movies
export const getWatchedMovies = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WATCHED_MOVIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting watched movies:', error);
    return [];
  }
};

export const addWatchedMovie = async (movie) => {
  try {
    const watchedMovies = await getWatchedMovies();
    const movieData = createMovieData(movie);

    // Check if movie is already watched
    const existingIndex = watchedMovies.findIndex(m => m.id === movie.id);
    if (existingIndex >= 0) {
      watchedMovies[existingIndex] = movieData;
    } else {
      watchedMovies.push(movieData);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.WATCHED_MOVIES, JSON.stringify(watchedMovies));
    return movieData;
  } catch (error) {
    console.error('Error adding watched movie:', error);
    throw error;
  }
};

export const removeWatchedMovie = async (movieId) => {
  try {
    const watchedMovies = await getWatchedMovies();
    const filteredMovies = watchedMovies.filter(m => m.id !== movieId);
    await AsyncStorage.setItem(STORAGE_KEYS.WATCHED_MOVIES, JSON.stringify(filteredMovies));
    return filteredMovies;
  } catch (error) {
    console.error('Error removing watched movie:', error);
    throw error;
  }
};

// Storage functions for reviews
export const getMovieReviews = async (movieId) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.REVIEWS);
    const allReviews = data ? JSON.parse(data) : [];
    return allReviews.filter(review => review.movieId === movieId);
  } catch (error) {
    console.error('Error getting movie reviews:', error);
    return [];
  }
};

export const addMovieReview = async (movieId, review) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.REVIEWS);
    const allReviews = data ? JSON.parse(data) : [];
    const reviewData = createReviewData(movieId, review);
    allReviews.push(reviewData);
    await AsyncStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(allReviews));
    return reviewData;
  } catch (error) {
    console.error('Error adding movie review:', error);
    throw error;
  }
};

export const updateMovieReview = async (reviewId, updatedReview) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.REVIEWS);
    const allReviews = data ? JSON.parse(data) : [];
    const reviewIndex = allReviews.findIndex(r => r.id === reviewId);

    if (reviewIndex >= 0) {
      allReviews[reviewIndex] = { ...allReviews[reviewIndex], ...updatedReview };
      await AsyncStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(allReviews));
      return allReviews[reviewIndex];
    }
    throw new Error('Review not found');
  } catch (error) {
    console.error('Error updating movie review:', error);
    throw error;
  }
};

export const deleteMovieReview = async (reviewId) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.REVIEWS);
    const allReviews = data ? JSON.parse(data) : [];
    const filteredReviews = allReviews.filter(r => r.id !== reviewId);
    await AsyncStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(filteredReviews));
    return filteredReviews;
  } catch (error) {
    console.error('Error deleting movie review:', error);
    throw error;
  }
};

// Storage functions for favorites
export const getFavoriteMovies = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting favorite movies:', error);
    return [];
  }
};

export const addFavoriteMovie = async (movie) => {
  try {
    const favorites = await getFavoriteMovies();
    const movieData = createMovieData(movie);

    // Check if movie is already in favorites
    const existingIndex = favorites.findIndex(m => m.id === movie.id);
    if (existingIndex >= 0) {
      favorites[existingIndex] = movieData;
    } else {
      favorites.push(movieData);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return movieData;
  } catch (error) {
    console.error('Error adding favorite movie:', error);
    throw error;
  }
};

export const removeFavoriteMovie = async (movieId) => {
  try {
    const favorites = await getFavoriteMovies();
    const filteredFavorites = favorites.filter(m => m.id !== movieId);
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filteredFavorites));
    return filteredFavorites;
  } catch (error) {
    console.error('Error removing favorite movie:', error);
    throw error;
  }
};

// Utility function to get movie statistics
export const getMovieStats = async () => {
  try {
    const watchedMovies = await getWatchedMovies();
    const reviews = await AsyncStorage.getItem(STORAGE_KEYS.REVIEWS);
    const allReviews = reviews ? JSON.parse(reviews) : [];

    const stats = {
      totalWatched: watchedMovies.length,
      totalReviews: allReviews.length,
      averageRating: allReviews.length > 0
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
        : 0,
      thisMonth: watchedMovies.filter(movie => {
        const movieDate = new Date(movie.watched_date);
        const now = new Date();
        return movieDate.getMonth() === now.getMonth() &&
               movieDate.getFullYear() === now.getFullYear();
      }).length,
    };

    return stats;
  } catch (error) {
    console.error('Error getting movie stats:', error);
    return {
      totalWatched: 0,
      totalReviews: 0,
      averageRating: 0,
      thisMonth: 0,
    };
  }
};