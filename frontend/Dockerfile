FROM node:20-alpine

WORKDIR /app

# Install dependencies only when needed
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/

# Install dependencies with caching - using production flag for smaller image
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY frontend ./frontend
COPY shared ./shared

# Set the working directory to the frontend project
WORKDIR /app/frontend

# Build the Next.js application
RUN yarn build

# Remove development dependencies
RUN yarn install --frozen-lockfile --production=true

EXPOSE 3000

# Run in production mode
CMD ["yarn", "start"] 