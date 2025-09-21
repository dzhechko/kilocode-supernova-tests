import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  getMovieDetails,
  getMovieCredits,
  getImageUrl,
  getSimilarMovies
} from '../services/api';
import {
  addWatchedMovie,
  addFavoriteMovie,
  getMovieReviews,
  addMovieReview,
  getWatchedMovies,
  getFavoriteMovies
} from '../utils/storage';

const { width, height } = Dimensions.get('window');

const MovieDetailsScreen = ({ route, navigation }) => {
  const { movie } = route.params;
  const [movieDetails, setMovieDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isWatched, setIsWatched] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadMovieData();
    checkMovieStatus();
  }, []);

  const loadMovieData = async () => {
    setLoading(true);
    try {
      const [details, credits, similar] = await Promise.all([
        getMovieDetails(movie.id),
        getMovieCredits(movie.id),
        getSimilarMovies(movie.id)
      ]);

      setMovieDetails(details);
      setCast(credits.cast.slice(0, 10)); // Top 10 cast members
      setSimilarMovies(similar.results.slice(0, 6)); // Top 6 similar movies
    } catch (error) {
      console.error('Error loading movie data:', error);
      Alert.alert('Error', 'Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const checkMovieStatus = async () => {
    try {
      const [watchedMovies, favoriteMovies] = await Promise.all([
        getWatchedMovies(),
        getFavoriteMovies()
      ]);

      setIsWatched(watchedMovies.some(m => m.id === movie.id));
      setIsFavorite(favoriteMovies.some(m => m.id === movie.id));
    } catch (error) {
      console.error('Error checking movie status:', error);
    }
  };

  const loadReviews = async () => {
    try {
      const movieReviews = await getMovieReviews(movie.id);
      setReviews(movieReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleAddToWatched = async () => {
    try {
      await addWatchedMovie(movie);
      setIsWatched(true);
      Alert.alert('Success', `${movie.title} added to watched movies!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add movie to watched list');
    }
  };

  const handleAddToFavorites = async () => {
    try {
      await addFavoriteMovie(movie);
      setIsFavorite(true);
      Alert.alert('Success', `${movie.title} added to favorites!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add movie to favorites');
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      await addMovieReview(movie.id, newReview);
      setNewReview({ rating: 5, comment: '' });
      setShowReviewModal(false);
      loadReviews();
      Alert.alert('Success', 'Review added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add review');
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && onRatingChange(star)}
            disabled={!interactive}
          >
            <Text style={[
              styles.star,
              { color: star <= rating ? '#FFD93D' : 'rgba(255, 255, 255, 0.3)' }
            ]}>
              ⭐
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading movie details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Movie Poster and Basic Info */}
      <View style={styles.header}>
        <Image
          source={{ uri: getImageUrl(movie.poster_path, 'w500') }}
          style={styles.poster}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.year}>
            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
          </Text>
          <Text style={styles.rating}>
            ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {!isWatched && (
          <TouchableOpacity
            style={[styles.actionButton, styles.watchButton]}
            onPress={handleAddToWatched}
          >
            <Text style={styles.actionButtonText}>Mark as Watched</Text>
          </TouchableOpacity>
        )}
        {!isFavorite && (
          <TouchableOpacity
            style={[styles.actionButton, styles.favoriteButton]}
            onPress={handleAddToFavorites}
          >
            <Text style={styles.actionButtonText}>Add to Favorites</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.reviewButton]}
          onPress={() => setShowReviewModal(true)}
        >
          <Text style={styles.actionButtonText}>Add Review</Text>
        </TouchableOpacity>
      </View>

      {/* Movie Details */}
      {movieDetails && (
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{movieDetails.overview}</Text>

          {movieDetails.genres && movieDetails.genres.length > 0 && (
            <View style={styles.genresContainer}>
              <Text style={styles.sectionTitle}>Genres</Text>
              <View style={styles.genresList}>
                {movieDetails.genres.map((genre) => (
                  <View key={genre.id} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Cast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castContainer}>
            {cast.map((actor) => (
              <View key={actor.id} style={styles.castMember}>
                <Image
                  source={{ uri: getImageUrl(actor.profile_path, 'w185') }}
                  style={styles.castPhoto}
                  resizeMode="cover"
                />
                <Text style={styles.castName} numberOfLines={2}>{actor.name}</Text>
                <Text style={styles.castCharacter} numberOfLines={1}>{actor.character}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Reviews Section */}
      <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>My Reviews</Text>
          <TouchableOpacity onPress={() => setShowReviewModal(true)}>
            <Text style={styles.addReviewText}>Add Review</Text>
          </TouchableOpacity>
        </View>

        {reviews.length === 0 ? (
          <Text style={styles.noReviewsText}>No reviews yet. Add one!</Text>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              {renderStars(review.rating)}
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewDate}>
                {new Date(review.date).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Review</Text>

            <Text style={styles.modalLabel}>Rating</Text>
            {renderStars(newReview.rating, true, (rating) =>
              setNewReview(prev => ({ ...prev, rating }))
            )}

            <Text style={styles.modalLabel}>Comment</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Write your review..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={newReview.comment}
              onChangeText={(comment) => setNewReview(prev => ({ ...prev, comment }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitReview}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 10,
  },
  header: {
    position: 'relative',
    height: height * 0.4,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  year: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  rating: {
    fontSize: 16,
    color: '#FFD93D',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  watchButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 217, 61, 0.2)',
    borderWidth: 1,
    borderColor: '#FFD93D',
  },
  reviewButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  detailsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  overview: {
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 20,
  },
  genresContainer: {
    marginBottom: 20,
  },
  genresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    color: '#fff',
    fontSize: 12,
  },
  castContainer: {
    marginBottom: 20,
  },
  castMember: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  castPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  castName: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  castCharacter: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    textAlign: 'center',
  },
  reviewsSection: {
    padding: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addReviewText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
  },
  noReviewsText: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  reviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    fontSize: 16,
    marginRight: 2,
  },
  reviewComment: {
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    marginBottom: 8,
  },
  reviewDate: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#333',
    fontSize: 16,
    marginBottom: 20,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  submitButton: {
    backgroundColor: '#4ECDC4',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default MovieDetailsScreen;