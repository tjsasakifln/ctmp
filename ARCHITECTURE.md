# Architecture Overview

## Multi-Service Monorepo Structure

This project uses a monorepo architecture with multiple independent services that can be deployed separately on Railway.

### Services

```
apps/
├── api/          # REST API service (Fastify)
├── worker/       # Background job processor (BullMQ workers)
├── scheduler/    # Cron job scheduler
└── shared/       # Shared code and utilities (future)
```

### Service Responsibilities

#### API Service (`apps/api`)
- Handles HTTP requests via Fastify
- Provides REST endpoints for webhooks and tools
- Health check endpoints (`/healthz`, `/readyz`)
- Does NOT process background jobs
- Port: 3000

#### Worker Service (`apps/worker`)
- Processes background jobs from Redis queues
- Runs BullMQ workers:
  - `check-djen-worker`: Monitors DJEN legal updates
  - `check-datajud-worker`: Monitors DataJud legal updates
  - `send-notification-worker`: Sends WhatsApp notifications
- No HTTP server

#### Scheduler Service (`apps/scheduler`)
- Manages cron jobs
- Enqueues daily verification jobs at 08:00 BRT
- No HTTP server

### Railway Deployment

Each service has its own:
- `Dockerfile`: Multi-stage build optimized for production
- `railway.json`: Railway-specific configuration
- `package.json`: Service dependencies and scripts

#### Deployment Configuration

**API Service:**
- Healthcheck: `/healthz`
- Exposed port: 3000
- Restart policy: ON_FAILURE (max 10 retries)

**Worker Service:**
- No healthcheck (long-running process)
- Restart policy: ON_FAILURE (max 10 retries)

**Scheduler Service:**
- No healthcheck (long-running process)
- Restart policy: ON_FAILURE (max 10 retries)

### Shared Dependencies

Services share:
- Database connection (PostgreSQL via Drizzle ORM)
- Redis connection (for BullMQ queues)
- Logger configuration (Pino)
- Environment variables

### Development

```bash
# Install dependencies for all services
npm install

# Run individual services in development
npm run dev:api
npm run dev:worker
npm run dev:scheduler

# Build all services
npm run build

# Build individual services
npm run build:api
npm run build:worker
npm run build:scheduler
```

### Environment Variables

All services require:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `NODE_ENV`: Environment (development/production)
- `PORT`: API service port (default: 3000)

Additional service-specific variables may be required (see each service's `.env.example`).

### Key Benefits

1. **Parallel Development**: Teams can work on different services independently
2. **Independent Scaling**: Each service can scale based on its own load
3. **Isolation**: Failures in one service don't affect others
4. **Optimized Resources**: Background jobs don't compete with API requests
5. **Clear Separation**: Each service has a single, well-defined responsibility

### Next Steps

This architecture enables:
- Issue #2: PostgreSQL and Redis configuration
- Issue #5: Secrets management via Railway
- Future microservices additions
- Independent CI/CD pipelines per service
