FROM node:20-alpine

WORKDIR /app

# Copy all package.json files for workspace setup
COPY package.json ./
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/

# Install all dependencies
RUN yarn install

# Copy source code
COPY frontend/ ./frontend/
COPY shared/ ./shared/

# Build shared module first
WORKDIR /app/shared
RUN yarn build

# Build the frontend
WORKDIR /app/frontend
RUN yarn build

# Clean up dev dependencies for production
RUN yarn install --production=true

EXPOSE 3000

# Run the frontend app
CMD ["yarn", "start"]