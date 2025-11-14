import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { healthRoutes } from '../../src/routes/health';

describe('Health Routes', () => {
  const fastify = Fastify();

  beforeAll(async () => {
    await fastify.register(healthRoutes);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('GET /healthz', () => {
    it('deve retornar status healthy', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/healthz',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.ok).toBe(true);
      expect(body.status).toBe('healthy');
    });
  });

  describe('GET /readyz', () => {
    it('deve verificar conexão com banco de dados', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/readyz',
      });

      // Pode ser 200 (se banco conectado) ou 503 (se não conectado)
      expect([200, 503]).toContain(response.statusCode);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('checks');
      expect(body.checks).toHaveProperty('database');
    });
  });
});
