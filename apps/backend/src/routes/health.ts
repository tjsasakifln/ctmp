import { FastifyInstance } from 'fastify';
import { db } from '../config/database.js';
import { sql } from 'drizzle-orm';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/healthz', async (_request, reply) => {
    return reply.send({ ok: true, status: 'healthy' });
  });

  fastify.get('/readyz', async (_request, reply) => {
    try {
      // Check database connection
      await db.execute(sql`SELECT 1`);

      return reply.send({
        ok: true,
        status: 'ready',
        checks: {
          database: 'ok',
        },
      });
    } catch (error) {
      return reply.status(503).send({
        ok: false,
        status: 'not ready',
        checks: {
          database: 'error',
        },
      });
    }
  });
}
