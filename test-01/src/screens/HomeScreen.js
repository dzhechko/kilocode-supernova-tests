import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Dimensions
} from 'react-native';
import { getMovieStats } from '../utils/storage';
import MovieCalendar from '../components/MovieCalendar';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalWatched: 0,
    totalReviews: 0,
    averageRating: 0,
    thisMonth: 0,
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateMovies, setSelectedDateMovies] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const movieStats = await getMovieStats();
    setStats(movieStats);
  };

  const handleDatePress = (dateKey, movieCount) => {
    setSelectedDate(dateKey);
    setSelectedDateMovies(movieCount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const StatCard = ({ title, value, subtitle, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Movie Tracker</Text>
        <Text style={styles.headerSubtitle}>Track your movie watching journey</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Total Watched"
          value={stats.totalWatched}
          color="#FF6B6B"
        />
        <StatCard
          title="This Month"
          value={stats.thisMonth}
          color="#4ECDC4"
        />
        <StatCard
          title="Reviews"
          value={stats.totalReviews}
          subtitle={`Avg: ${stats.averageRating}★`}
          color="#FFD93D"
        />
      </View>

      {/* Calendar Section */}
      <View style={styles.calendarSection}>
        <MovieCalendar onDatePress={handleDatePress} />
      </View>

      {/* Date Details Modal */}
      <Modal
        visible={selectedDate !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedDate(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedDate(null)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Movies Watched</Text>
            <Text style={styles.modalDate}>{formatDate(selectedDate)}</Text>
            <Text style={styles.modalCount}>
              {selectedDateMovies} {selectedDateMovies === 1 ? 'movie' : 'movies'} watched
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setSelectedDate(null)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  calendarSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    minWidth: width * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;