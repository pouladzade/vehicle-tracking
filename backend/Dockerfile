FROM node:20-alpine

WORKDIR /app

# Copy all package.json files for workspace setup

COPY backend/package.json ./backend/

# Copy source code
COPY backend/ ./backend/

# Build the backend
WORKDIR /app/backend

# Create migrations directory and copy migrations
RUN mkdir -p dist/db/migrations
# The migrations are already copied with the entire backend directory

RUN yarn install --frozen-lockfile --production=false
# Build the project
RUN yarn build

# Clean up dev dependencies for production
RUN yarn install --production=true

EXPOSE 5000

# Run the backend app
CMD ["node", "dist/server.js"]