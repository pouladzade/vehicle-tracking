FROM node:20-alpine

WORKDIR /app

# Copy all package.json files for workspace setup

COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/

# Copy source code
COPY frontend/ ./frontend/
COPY shared/ ./shared/

# Build shared module first
WORKDIR /app/shared
RUN yarn install --frozen-lockfile --production=false
RUN yarn build

# Build the frontend
WORKDIR /app/frontend
RUN yarn install --frozen-lockfile --production=false
RUN yarn build

# Clean up dev dependencies for production
RUN yarn install --production=true

EXPOSE 3000

# Run the frontend app
CMD ["yarn", "start"]