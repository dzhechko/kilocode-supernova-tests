# Movie Tracker App

A beautiful movie tracking application built with Expo React Native, featuring a GitHub-style calendar view to track your movie watching habits.

## Features

- 🎬 **Movie Search**: Search for movies using the TMDB API
- 📅 **GitHub-Style Calendar**: Visual calendar showing movies watched per day
- ⭐ **Reviews System**: Add and manage personal reviews for movies
- ❤️ **Favorites**: Keep track of your favorite movies
- 📊 **Statistics**: View your movie watching statistics
- 🎨 **Beautiful UI**: Red, blue, and yellow color scheme with transparency effects

## Setup

### Option 1: Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Get TMDB API Key**
   - Visit [The Movie Database (TMDB)](https://www.themoviedb.org/settings/api)
   - Create an account and request an API key

3. **Configure Environment Variables**
   - Copy the `.env` file and update it with your API key:
   ```bash
   TMDB_API_KEY=your_actual_api_key_here
   ```
   - Replace `your_actual_api_key_here` with your real TMDB API key

4. **Run the App**
   ```bash
   npm start
   ```

### Option 2: Docker Development

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Or build and run manually:**
   ```bash
   docker build -t movie-tracker .
   docker run -p 19006:19006 -p 19000:19000 -p 19001:19001 movie-tracker
   ```

3. **Access the app:**
   - Expo DevTools: http://localhost:19006
   - Metro Bundler: http://localhost:19000
   - Web Interface: http://localhost:19001

**See [Docker-Setup.md](Docker-Setup.md) for detailed Docker instructions.**

## Environment Variables

The app uses the following environment variables (configured in `.env`):

- `TMDB_API_KEY` - Your TMDB API key (required)
- `TMDB_BASE_URL` - TMDB API base URL (default: https://api.themoviedb.org/3)
- `TMDB_IMAGE_BASE_URL` - TMDB images base URL (default: https://image.tmdb.org/t/p)
- `APP_NAME` - App name (default: Movie Tracker)
- `APP_VERSION` - App version (default: 1.0.0)

**⚠️ Important**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

## Color Scheme

The app uses a vibrant color palette:
- **Red (#FF6B6B)**: Primary actions, watched movies, calendar intensity
- **Blue-Green (#4ECDC4)**: Secondary actions, reviews
- **Yellow (#FFD93D)**: Favorites, ratings, highlights
- **Transparency**: Used throughout for modern, smooth appearance

## App Structure

- **Home**: Main dashboard with calendar view and statistics
- **Search**: Discover new movies with TMDB integration
- **Favorites**: Your personal collection of favorite movies
- **Movie Details**: Detailed view with cast, reviews, and actions

## Data Storage

All data is stored locally using AsyncStorage:
- Watched movies with dates
- Personal reviews and ratings
- Favorite movies
- Movie statistics

## Calendar View

The GitHub-style calendar shows:
- Daily movie watching activity
- Color intensity based on movies watched per day
- Monthly organization
- Tap on any day to see details

## API Integration

The app integrates with TMDB API v3 for:
- Movie search and discovery
- Detailed movie information
- Cast and crew data
- Similar movie recommendations
- Movie posters and images

## Technologies Used

- **React Native** with Expo
- **React Navigation** for navigation
- **AsyncStorage** for local data persistence
- **Axios** for API requests
- **TMDB API** for movie data

## Contributing

Feel free to contribute to this project by:
- Adding new features
- Improving the UI/UX
- Fixing bugs
- Adding more API integrations

## License

This project is open source and available under the MIT License.