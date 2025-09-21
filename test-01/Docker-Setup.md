# Docker Setup for Movie Tracker App

This guide provides complete Docker configuration for the Movie Tracker Expo React Native app.

## Files to Create

### 1. Dockerfile

```dockerfile
# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for Expo
RUN apk add --no-cache \
    bash \
    curl \
    git \
    openssh \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./
COPY .env.example .env

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 19006

# Set environment variables
ENV NODE_ENV=development
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Start the app
CMD ["npm", "start"]
```

### 2. docker-compose.yml

```yaml
version: '3.8'

services:
  movie-tracker:
    build: .
    ports:
      - "19006:19006"  # Expo DevTools
      - "19000:19000"  # Metro bundler
      - "19001:19001"  # Web interface
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
      - REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0
    networks:
      - movie-tracker-network

networks:
  movie-tracker-network:
    driver: bridge
```

### 3. .dockerignore

```dockerignore
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Expo
.expo
.expo-shared

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro bundler
.metro-health-check*

# Debug logs
*.log

# Temporary folders
tmp/
temp/

# OS
.DS_Store
*.pem

# IDE
.vscode
.idea

# Git
.git
.gitignore

# Docker
Dockerfile*
docker-compose*
.dockerignore

# Documentation
README.md
*.md
```

### 4. .env.example

```env
# TMDB API Configuration
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# App Configuration
APP_NAME=Movie Tracker
APP_VERSION=1.0.0

# Docker Environment
NODE_ENV=development
EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
```

## Usage Instructions

### Building and Running with Docker

1. **Build the Docker image:**
   ```bash
   docker build -t movie-tracker .
   ```

2. **Run with docker-compose:**
   ```bash
   docker-compose up
   ```

3. **Run with docker directly:**
   ```bash
   docker run -p 19006:19006 -p 19000:19000 -p 19001:19001 movie-tracker
   ```

### Development Workflow

1. **Start the container:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

4. **Rebuild after changes:**
   ```bash
   docker-compose up --build
   ```

### Environment Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env with your TMDB API key:**
   ```bash
   nano .env
   ```

3. **Restart the container:**
   ```bash
   docker-compose restart
   ```

## Accessing the App

After starting the container, you can access:

- **Expo DevTools:** http://localhost:19006
- **Metro Bundler:** http://localhost:19000
- **Web Interface:** http://localhost:19001

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the ports
   lsof -i :19006
   lsof -i :19000
   lsof -i :19001

   # Use different ports
   docker run -p 19007:19006 -p 19002:19000 -p 19003:19001 movie-tracker
   ```

2. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Node modules issues:**
   ```bash
   # Remove node_modules and reinstall
   docker-compose down
   rm -rf node_modules
   docker-compose build --no-cache
   docker-compose up
   ```

### Logs and Debugging

```bash
# View container logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Access container shell
docker-compose exec movie-tracker sh
```

## Production Considerations

For production deployment, consider:

1. **Multi-stage builds** for smaller images
2. **Environment-specific configurations**
3. **Health checks** in docker-compose.yml
4. **Volume mounts** for persistent data
5. **Reverse proxy** with nginx
6. **SSL certificates** for HTTPS

## Additional Scripts

Add these to your package.json scripts section:

```json
{
  "scripts": {
    "docker:build": "docker build -t movie-tracker .",
    "docker:run": "docker run -p 19006:19006 -p 19000:19000 -p 19001:19001 movie-tracker",
    "docker:up": "docker-compose up",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "docker:shell": "docker-compose exec movie-tracker sh"
  }
}
```

## Quick Start Commands

```bash
# Development with Docker (recommended)
npm run docker:dev

# Production build
npm run docker:build

# Run container
npm run docker:run

# View logs
npm run docker:logs

# Stop container
npm run docker:down

# Access container shell
npm run docker:shell
```