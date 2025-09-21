import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

// Import screens (we'll create these next)
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import MovieDetailsScreen from './src/screens/MovieDetailsScreen';

// Import components
import CustomTabBar from './src/components/CustomTabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack Navigator
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: 'Movie Tracker' }}
      />
      <Stack.Screen
        name="MovieDetails"
        component={MovieDetailsScreen}
        options={{ title: 'Movie Details' }}
      />
    </Stack.Navigator>
  );
}

// Search Stack Navigator
function SearchStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="SearchMain"
        component={SearchScreen}
        options={{ title: 'Search Movies' }}
      />
      <Stack.Screen
        name="MovieDetails"
        component={MovieDetailsScreen}
        options={{ title: 'Movie Details' }}
      />
    </Stack.Navigator>
  );
}

// Favorites Stack Navigator
function FavoritesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="FavoritesMain"
        component={FavoritesScreen}
        options={{ title: 'My Favorites' }}
      />
      <Stack.Screen
        name="MovieDetails"
        component={MovieDetailsScreen}
        options={{ title: 'Movie Details' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Tab.Navigator
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeStack}
            options={{
              tabBarLabel: 'Home',
            }}
          />
          <Tab.Screen
            name="Search"
            component={SearchStack}
            options={{
              tabBarLabel: 'Search',
            }}
          />
          <Tab.Screen
            name="Favorites"
            component={FavoritesStack}
            options={{
              tabBarLabel: 'Favorites',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});