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
RUN npm ci && npm cache clean --force

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