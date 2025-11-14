FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package.json and workspace setup
COPY package*.json ./
COPY apps/scheduler/package*.json ./apps/scheduler/
COPY apps/api/package*.json ./apps/api/

# Install dependencies for all workspaces
RUN npm ci

# Copy source code for api (needed for shared code) and scheduler
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/src ./apps/api/src
COPY apps/scheduler/tsconfig.json ./apps/scheduler/
COPY apps/scheduler/src ./apps/scheduler/src

# Build scheduler service
WORKDIR /app/apps/scheduler
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./
COPY apps/scheduler/package*.json ./apps/scheduler/
COPY apps/api/package*.json ./apps/api/

# Install production dependencies
RUN npm ci --only=production

# Copy built scheduler
COPY --from=builder /app/apps/scheduler/dist ./apps/scheduler/dist
# Copy api dist (for shared code)
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/scheduler

CMD ["node", "dist/index.js"]
