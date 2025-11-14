import { FastifyRequest } from 'fastify';
import { nanoid } from 'nanoid';
import type { RequestContext } from '../types/index.js';

declare module 'fastify' {
  interface FastifyRequest {
    context: RequestContext;
  }
}

export function createRequestContext(request: FastifyRequest): RequestContext {
  return {
    requestId: request.headers['x-request-id'] as string || nanoid(),
  };
}

export function enrichContext(
  request: FastifyRequest,
  data: Partial<Omit<RequestContext, 'requestId'>>
): void {
  request.context = {
    ...request.context,
    ...data,
  };
}
