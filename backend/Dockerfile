FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies with caching
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . ./

# Create migrations directory
RUN mkdir -p dist/db/migrations
COPY src/db/migrations/ dist/db/migrations/

# Build the project
RUN yarn build

# Remove development dependencies
RUN yarn install --frozen-lockfile --production=true

EXPOSE 5000

# Run in production mode
CMD ["node", "dist/server.js"] 