FROM node:20-alpine

WORKDIR /app

# Copy all package.json files for workspace setup
COPY package.json ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# Install all dependencies
RUN yarn install

# Copy source code
COPY backend/ ./backend/
COPY shared/ ./shared/

# Build shared module first
WORKDIR /app/shared
RUN yarn build

# Build the backend
WORKDIR /app/backend

# Create migrations directory and copy migrations
RUN mkdir -p dist/db/migrations
# The migrations are already copied with the entire backend directory

# Build the project
RUN yarn build

# Clean up dev dependencies for production
RUN yarn install --production=true

EXPOSE 5000

# Run the backend app
CMD ["node", "dist/server.js"]