import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getWatchedMovies } from '../utils/storage';

const MovieCalendar = ({ onDatePress }) => {
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadWatchedMovies();
  }, []);

  const loadWatchedMovies = async () => {
    const movies = await getWatchedMovies();
    setWatchedMovies(movies);
  };

  // Generate calendar data for the selected year
  const generateCalendarData = () => {
    const calendarData = {};
    const currentYear = new Date().getFullYear();

    // Initialize all days of the year
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        calendarData[dateKey] = 0;
      }
    }

    // Count movies watched per day
    watchedMovies.forEach(movie => {
      if (movie.watched_date) {
        const date = new Date(movie.watched_date);
        if (date.getFullYear() === currentYear) {
          const dateKey = date.toISOString().split('T')[0];
          if (calendarData[dateKey] !== undefined) {
            calendarData[dateKey]++;
          }
        }
      }
    });

    return calendarData;
  };

  const calendarData = generateCalendarData();

  // Get intensity level for a day (0-4)
  const getIntensityLevel = (count) => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4; // 4 or more
  };

  // Get color based on intensity
  const getIntensityColor = (level) => {
    const colors = [
      'rgba(255, 255, 255, 0.1)', // Level 0
      'rgba(255, 107, 107, 0.3)', // Level 1 - Light red
      'rgba(255, 107, 107, 0.5)', // Level 2 - Medium red
      'rgba(255, 107, 107, 0.7)', // Level 3 - Strong red
      'rgba(255, 107, 107, 0.9)', // Level 4 - Very strong red
    ];
    return colors[level];
  };

  // Generate month data
  const generateMonthData = () => {
    const months = [];
    const currentYear = new Date().getFullYear();

    for (let month = 0; month < 12; month++) {
      const monthData = {
        name: new Date(currentYear, month, 1).toLocaleString('default', { month: 'short' }),
        days: [],
        totalMovies: 0,
      };

      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      const firstDayOfWeek = new Date(currentYear, month, 1).getDay();

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDayOfWeek; i++) {
        monthData.days.push({ day: '', count: 0, isEmpty: true });
      }

      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const count = calendarData[dateKey] || 0;
        monthData.totalMovies += count;
        monthData.days.push({
          day,
          count,
          isEmpty: false,
          dateKey,
          intensity: getIntensityLevel(count),
        });
      }

      months.push(monthData);
    }

    return months;
  };

  const monthData = generateMonthData();

  const renderMonth = (month) => {
    return (
      <View key={month.name} style={styles.monthContainer}>
        <Text style={styles.monthTitle}>{month.name}</Text>
        <View style={styles.daysGrid}>
          {month.days.map((dayData, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                {
                  backgroundColor: dayData.isEmpty
                    ? 'transparent'
                    : getIntensityColor(dayData.intensity),
                }
              ]}
              onPress={() => {
                if (!dayData.isEmpty && dayData.count > 0 && onDatePress) {
                  onDatePress(dayData.dateKey, dayData.count);
                }
              }}
              disabled={dayData.isEmpty || dayData.count === 0}
            >
              {!dayData.isEmpty && (
                <Text style={[
                  styles.dayText,
                  { color: dayData.count > 0 ? '#fff' : 'rgba(255, 255, 255, 0.3)' }
                ]}>
                  {dayData.day}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Movies Watched This Year</Text>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarContainer}>
          {monthData.map(renderMonth)}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Less</Text>
        {[0, 1, 2, 3, 4].map(level => (
          <View
            key={level}
            style={[
              styles.legendItem,
              { backgroundColor: getIntensityColor(level) }
            ]}
          />
        ))}
        <Text style={styles.legendTitle}>More</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  calendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthContainer: {
    width: '31%',
    marginBottom: 20,
  },
  monthTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: 12,
    height: 12,
    margin: 1,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 8,
    fontWeight: '500',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  legendTitle: {
    color: '#666',
    fontSize: 12,
    marginHorizontal: 8,
  },
  legendItem: {
    width: 12,
    height: 12,
    marginHorizontal: 2,
    borderRadius: 2,
  },
});

export default MovieCalendar;