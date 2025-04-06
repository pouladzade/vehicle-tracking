FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies with caching
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . ./

# Build the Next.js application
RUN yarn build

# Remove development dependencies
RUN yarn install --frozen-lockfile --production=true

EXPOSE 3000

# Run in production mode
CMD ["yarn", "start"] 