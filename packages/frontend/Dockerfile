FROM node:20-alpine

WORKDIR /app

# Install dependencies only when needed
COPY package.json yarn.lock ./
COPY packages/frontend/package.json ./packages/frontend/
COPY shared/package.json ./shared/

# Install dependencies with caching - using production flag for smaller image
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY packages/frontend ./packages/frontend
COPY shared ./shared

# Set the working directory to the frontend project
WORKDIR /app/packages/frontend

# Build the Next.js application
RUN yarn build

# Remove development dependencies
RUN yarn install --frozen-lockfile --production=true

EXPOSE 3000

# Run in production mode
CMD ["yarn", "start"] 