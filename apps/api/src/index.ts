import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { createRequestContext } from './utils/request-context.js';
import { AppError } from './utils/errors.js';
import { webhookRoutes } from './routes/webhooks.js';
import { toolsRoutes } from './routes/tools.js';
import { healthRoutes } from './routes/health.js';

const fastify = Fastify({
  logger: logger,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
  disableRequestLogging: false,
  genReqId: (req) => req.headers['x-request-id'] as string || undefined,
});

// Security plugins
await fastify.register(helmet, {
  contentSecurityPolicy: false,
});

await fastify.register(cors, {
  origin: env.NODE_ENV === 'production' ? false : true,
});

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  cache: 10000,
  allowList: ['127.0.0.1'],
  redis: env.REDIS_URL,
});

// Request context hook
fastify.addHook('onRequest', async (request, _reply) => {
  request.context = createRequestContext(request);
});

// Logging hooks
fastify.addHook('onResponse', async (request, reply) => {
  request.log.info(
    {
      requestId: request.context.requestId,
      clientId: request.context.clientId,
      caseId: request.context.caseId,
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime(),
    },
    'Request completed'
  );
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    request.log.warn(
      {
        requestId: request.context.requestId,
        code: error.code,
        details: error.details,
      },
      error.message
    );

    return reply.status(error.statusCode).send({
      ok: false,
      error: error.message,
      code: error.code,
      details: error.details,
    });
  }

  // Log unhandled errors
  request.log.error(
    {
      requestId: request.context.requestId,
      err: error,
    },
    'Unhandled error'
  );

  return reply.status(500).send({
    ok: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
});

// Register routes
await fastify.register(healthRoutes);
await fastify.register(webhookRoutes, { prefix: '/webhooks' });
await fastify.register(toolsRoutes, { prefix: '/tools' });

// Start server
const start = async (): Promise<void> => {
  try {
    const port = parseInt(env.PORT, 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    logger.info(`Server listening on port ${port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
