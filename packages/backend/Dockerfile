FROM node:20-alpine

WORKDIR /app

# Install dependencies only when needed
COPY package.json yarn.lock ./
COPY packages/backend/package.json ./packages/backend/
COPY shared/package.json ./shared/

# Install dependencies with caching - using production flag for smaller image
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY packages/backend ./packages/backend
COPY shared ./shared

# Set the working directory to the backend project
WORKDIR /app/packages/backend

# Create migrations directory
RUN mkdir -p dist/db/migrations
COPY packages/backend/src/db/migrations/ dist/db/migrations/

# Build the project
RUN yarn build

# Remove development dependencies
RUN yarn install --frozen-lockfile --production=true

EXPOSE 5000

# Run in production mode
CMD ["node", "dist/server.js"] 