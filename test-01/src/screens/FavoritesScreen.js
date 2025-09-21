import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getFavoriteMovies, removeFavoriteMovie } from '../utils/storage';
import { getImageUrl } from '../services/api';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favoriteMovies = await getFavoriteMovies();
      setFavorites(favoriteMovies);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (movieId, movieTitle) => {
    Alert.alert(
      'Remove from Favorites',
      `Are you sure you want to remove "${movieTitle}" from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFavoriteMovie(movieId);
              setFavorites(prev => prev.filter(movie => movie.id !== movieId));
              Alert.alert('Success', 'Movie removed from favorites');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove movie from favorites');
            }
          },
        },
      ]
    );
  };

  const handleMoviePress = (movie) => {
    navigation.navigate('MovieDetails', { movie });
  };

  const renderFavoriteCard = ({ item }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => handleMoviePress(item)}
    >
      <Image
        source={{ uri: getImageUrl(item.poster_path, 'w500') }}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.releaseYear}>
          {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
        </Text>
        <Text style={styles.rating}>
          ⭐ {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
        </Text>
        <Text style={styles.watchedDate}>
          Added: {new Date(item.watched_date).toLocaleDateString()}
        </Text>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(item.id, item.title)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>❤️</Text>
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start exploring movies and add them to your favorites!
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Search')}
      >
        <Text style={styles.exploreButtonText}>Explore Movies</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD93D" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <Text style={styles.headerSubtitle}>
          {favorites.length} {favorites.length === 1 ? 'movie' : 'movies'} in your collection
        </Text>
      </View>

      {favorites.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  resultsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  movieCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: '47%',
  },
  poster: {
    width: '100%',
    height: 200,
  },
  movieInfo: {
    padding: 12,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  releaseYear: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 2,
  },
  rating: {
    color: '#FFD93D',
    fontSize: 12,
    marginBottom: 4,
  },
  watchedDate: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  removeButtonText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: '#FFD93D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FavoritesScreen;