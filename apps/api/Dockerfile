FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package.json and workspace setup
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies for all workspaces
RUN npm ci

# Copy source code
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/src ./apps/api/src
COPY apps/api/drizzle.config.ts ./apps/api/

# Build API service
WORKDIR /app/apps/api
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install production dependencies
RUN npm ci --only=production

# Copy built API
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node", "dist/index.js"]
