import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { searchMovies, getImageUrl } from '../services/api';
import { addWatchedMovie, addFavoriteMovie } from '../utils/storage';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Load popular movies on initial load
    loadPopularMovies();
  }, []);

  const loadPopularMovies = async () => {
    setLoading(true);
    try {
      const response = await searchMovies('popular', 1);
      setSearchResults(response.results);
      setPage(1);
      setHasMore(response.page < response.total_pages);
    } catch (error) {
      console.error('Error loading popular movies:', error);
      Alert.alert('Error', 'Failed to load popular movies');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      loadPopularMovies();
      return;
    }

    setLoading(true);
    try {
      const response = await searchMovies(query, 1);
      setSearchResults(response.results);
      setPage(1);
      setHasMore(response.page < response.total_pages);
    } catch (error) {
      console.error('Error searching movies:', error);
      Alert.alert('Error', 'Failed to search movies');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      let response;

      if (searchQuery.trim()) {
        response = await searchMovies(searchQuery, nextPage);
      } else {
        // This would need to be implemented in the API service
        // For now, we'll just show popular movies
        response = await searchMovies('popular', nextPage);
      }

      setSearchResults(prev => [...prev, ...response.results]);
      setPage(nextPage);
      setHasMore(response.page < response.total_pages);
    } catch (error) {
      console.error('Error loading more movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoviePress = (movie) => {
    navigation.navigate('MovieDetails', { movie });
  };

  const handleAddToWatched = async (movie) => {
    try {
      await addWatchedMovie(movie);
      Alert.alert('Success', `${movie.title} added to watched movies!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add movie to watched list');
    }
  };

  const handleAddToFavorites = async (movie) => {
    try {
      await addFavoriteMovie(movie);
      Alert.alert('Success', `${movie.title} added to favorites!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add movie to favorites');
    }
  };

  const renderMovieCard = ({ item }) => (
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

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.watchButton]}
            onPress={() => handleAddToWatched(item)}
          >
            <Text style={styles.actionButtonText}>Watched</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.favoriteButton]}
            onPress={() => handleAddToFavorites(item)}
          >
            <Text style={styles.actionButtonText}>❤️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for movies..."
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch(searchQuery)}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => handleSearch(searchQuery)}
        >
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading && searchResults.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading movies...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderMovieCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.resultsContainer}
          onEndReached={loadMoreMovies}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            loading && searchResults.length > 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FF6B6B" />
              </View>
            ) : null
          }
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
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
  },
  searchButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchButtonText: {
    fontSize: 20,
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
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2,
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
  actionButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 10,
  },
});

export default SearchScreen;