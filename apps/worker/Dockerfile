FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package.json and workspace setup
COPY package*.json ./
COPY apps/worker/package*.json ./apps/worker/
COPY apps/api/package*.json ./apps/api/

# Install dependencies for all workspaces
RUN npm ci

# Copy source code for api (needed for shared code) and worker
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/src ./apps/api/src
COPY apps/worker/tsconfig.json ./apps/worker/
COPY apps/worker/src ./apps/worker/src

# Build worker service
WORKDIR /app/apps/worker
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./
COPY apps/worker/package*.json ./apps/worker/
COPY apps/api/package*.json ./apps/api/

# Install production dependencies
RUN npm ci --only=production

# Copy built worker
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
# Copy api dist (for shared code)
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/worker

CMD ["node", "dist/index.js"]
