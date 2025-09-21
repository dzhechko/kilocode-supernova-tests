import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const getTabColor = () => {
          switch (index) {
            case 0: return '#FF6B6B'; // Red for Home
            case 1: return '#4ECDC4'; // Blue-green for Search
            case 2: return '#FFD93D'; // Yellow for Favorites
            default: return '#666';
          }
        };

        const getTabIcon = () => {
          switch (index) {
            case 0: return '🏠';
            case 1: return '🔍';
            case 2: return '❤️';
            default: return '•';
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[
              styles.tab,
              {
                backgroundColor: isFocused
                  ? `${getTabColor()}20`
                  : 'transparent'
              }
            ]}
          >
            <View style={[
              styles.tabContent,
              {
                borderColor: isFocused ? getTabColor() : 'transparent',
                borderWidth: isFocused ? 2 : 0,
              }
            ]}>
              <Text style={[
                styles.icon,
                { color: isFocused ? getTabColor() : '#666' }
              ]}>
                {getTabIcon()}
              </Text>
              <Text style={[
                styles.label,
                { color: isFocused ? getTabColor() : '#666' }
              ]}>
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    height: 80,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CustomTabBar;