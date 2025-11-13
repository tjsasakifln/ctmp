# Issue #5: Add Correlation IDs to Structured Logs

## 🎯 Objetivo
Implementar correlation IDs (requestId, clientId, caseId, tenantId) em todos os logs para rastreabilidade end-to-end de requests.

## 📋 Contexto
**Situação Atual:**
- Logging básico com Pino implementado
- Falta correlação entre logs de uma mesma request
- Difícil debugar fluxos multi-etapa (webhook → worker → notification)
- Sem contexto de cliente/caso nos logs

**Impacto:**
- Rastreabilidade completa de requests
- Debug facilitado de issues em produção
- Melhor observabilidade
- Preparação para Grafana/Loki queries

## ✅ Critérios de Aceitação

1. [ ] Middleware Fastify que injeta `requestId` em todas as requests
2. [ ] `requestId` propagado para todos os logs da request
3. [ ] `clientId` adicionado aos logs quando cliente identificado
4. [ ] `caseId` adicionado aos logs quando processo identificado
5. [ ] `tenantId` preparado (null por enquanto, para multi-tenancy futuro)
6. [ ] Workers BullMQ recebem e propagam correlation IDs
7. [ ] Logs estruturados incluem correlation IDs no formato JSON
8. [ ] Documentação de logging atualizada

## 🔧 Detalhes Técnicos

### Passo 1: Request Context Middleware

**Arquivo:** `apps/backend/src/utils/request-context.ts` (já existe)

Atualizar para incluir todos os IDs:
```typescript
import { nanoid } from 'nanoid';
import { FastifyRequest } from 'fastify';

export interface RequestContext {
  requestId: string;
  clientId: string | null;
  caseId: string | null;
  tenantId: string | null; // Para futuro multi-tenancy
}

export function createRequestContext(request: FastifyRequest): RequestContext {
  return {
    requestId: nanoid(),
    clientId: null,
    caseId: null,
    tenantId: null,
  };
}

export function updateRequestContext(
  context: RequestContext,
  updates: Partial<Omit<RequestContext, 'requestId'>>
): RequestContext {
  return { ...context, ...updates };
}

declare module 'fastify' {
  interface FastifyRequest {
    context: RequestContext;
  }
}
```

### Passo 2: Fastify Plugin

**Arquivo:** `apps/backend/src/config/request-context-plugin.ts` (criar)

```typescript
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { createRequestContext } from '../utils/request-context';

const requestContextPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (request) => {
    // Cria contexto na entrada da request
    request.context = createRequestContext(request);

    // Adiciona correlation IDs ao logger da request
    request.log = request.log.child({
      requestId: request.context.requestId,
      clientId: request.context.clientId,
      caseId: request.context.caseId,
      tenantId: request.context.tenantId,
    });
  });

  // Hook para atualizar logger quando contexto mudar
  fastify.decorateRequest('updateContext', function (
    this: FastifyRequest,
    updates: Partial<Omit<RequestContext, 'requestId'>>
  ) {
    Object.assign(this.context, updates);

    // Atualiza logger com novos IDs
    this.log = this.log.child({
      clientId: this.context.clientId,
      caseId: this.context.caseId,
      tenantId: this.context.tenantId,
    });
  });
};

export default fp(requestContextPlugin, {
  name: 'request-context',
  fastify: '4.x',
});
```

### Passo 3: Registrar Plugin no Server

**Arquivo:** `apps/backend/src/index.ts`

```typescript
import requestContextPlugin from './config/request-context-plugin';

// ... após criar fastify instance

await fastify.register(requestContextPlugin);
```

### Passo 4: Usar Contexto nas Rotas

**Exemplo:** `apps/backend/src/features/notifications/whatsapp-handler.ts`

```typescript
export async function handleWhatsAppWebhook(
  request: FastifyRequest<{ Body: WhatsAppWebhookPayload }>,
  reply: FastifyReply
) {
  const { body } = request;

  // Log com requestId automático
  request.log.info({ webhook: body }, 'Received WhatsApp webhook');

  // ... buscar cliente
  const client = await clientRepository.findByPhone(phone);

  if (client) {
    // Atualizar contexto com clientId
    request.updateContext({ clientId: client.id });

    // Agora todos os logs incluem clientId
    request.log.info('Client identified');

    // ... buscar caso
    const case = await caseRepository.findByClientId(client.id);

    if (case) {
      // Atualizar contexto com caseId
      request.updateContext({ caseId: case.id });
      request.log.info('Case identified');
    }
  }

  // Todos os logs seguintes incluem requestId, clientId, caseId
  request.log.info('Processing message');
}
```

### Passo 5: Propagação para Workers

**Arquivo:** `apps/backend/src/jobs/send-notification-worker.ts`

```typescript
import { Worker, Job } from 'bullmq';
import { logger } from '../config/logger';

interface NotificationJobData {
  notificationId: string;
  clientId: string;
  caseId: string;
  // Adicionar correlation IDs
  requestId?: string;
  tenantId?: string | null;
}

const worker = new Worker(
  'send-notification',
  async (job: Job<NotificationJobData>) => {
    // Criar logger child com correlation IDs
    const jobLogger = logger.child({
      jobId: job.id,
      requestId: job.data.requestId,
      clientId: job.data.clientId,
      caseId: job.data.caseId,
      tenantId: job.data.tenantId,
    });

    jobLogger.info('Processing notification job');

    // ... processar job usando jobLogger

    jobLogger.info('Notification sent successfully');
  },
  {
    connection: redisConnection,
  }
);
```

**Ao enfileirar job:**
```typescript
await notificationQueue.add('send-notification', {
  notificationId: notification.id,
  clientId: request.context.clientId,
  caseId: request.context.caseId,
  // Propagar correlation IDs
  requestId: request.context.requestId,
  tenantId: request.context.tenantId,
});
```

### Passo 6: Formato de Log

**Exemplo de log estruturado:**
```json
{
  "level": 30,
  "time": 1699999999999,
  "pid": 12345,
  "hostname": "api-staging-xxx",
  "requestId": "V1StGXR8_Z5jdHi6B-myT",
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "caseId": "660e8400-e29b-41d4-a716-446655440001",
  "tenantId": null,
  "msg": "Processing WhatsApp message",
  "phone": "+5548999990001",
  "messageType": "text"
}
```

### Passo 7: Validação

**Comandos de teste:**
```bash
# Enviar request de teste
curl -X POST http://localhost:3000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d @test-payload.json

# Verificar logs (deve ter requestId em todos)
cat logs/app.log | jq 'select(.requestId != null)'

# Verificar propagação de clientId
cat logs/app.log | jq 'select(.clientId != null)'

# Verificar logs de worker incluem correlation IDs
cat logs/app.log | jq 'select(.jobId != null) | {requestId, clientId, caseId}'
```

## 📦 Dependências
- **Depende de:** Nenhuma (independente)
- **Bloqueia:** Issue #6 (Metrics endpoint usa correlation IDs)
- **Relacionado:** ROADMAP Fase 1, Semana 2, Tarefa 2.1

## 🏷️ Labels
- `priority: medium`
- `type: enhancement`
- `area: observability`
- `effort: 3-4h`
- `phase: 1-week-2`

## 📚 Referências
- [Pino Logger](https://getpino.io/)
- [Fastify Request Lifecycle](https://fastify.dev/docs/latest/Reference/Lifecycle/)
- [BullMQ Job Data](https://docs.bullmq.io/guide/jobs)
- ROADMAP.md - Fase 1, Semana 2

## ✍️ Notas para Implementação

**Best Practices:**
1. Sempre propagar requestId através de chamadas assíncronas
2. Criar child loggers para manter correlação
3. Incluir correlation IDs em erros logados
4. Não expor IDs sensíveis (usar UUIDs, não IDs sequenciais)

**Troubleshooting:**
- Se logs não mostram IDs: verificar plugin registrado antes das rotas
- Se IDs perdidos em workers: verificar propagação no job data
- Se performance impacto: child logger é barato (não clonar por log)

**Testes:**
```typescript
// apps/backend/test/utils/request-context.test.ts
describe('Request Context', () => {
  it('should create context with requestId', () => {
    const context = createRequestContext(mockRequest);
    expect(context.requestId).toBeDefined();
    expect(context.clientId).toBeNull();
  });

  it('should update context with clientId', () => {
    const context = createRequestContext(mockRequest);
    const updated = updateRequestContext(context, { clientId: 'client-123' });
    expect(updated.clientId).toBe('client-123');
    expect(updated.requestId).toBe(context.requestId); // Preserved
  });
});
```

## 🎯 Deliverables
- [ ] Plugin `request-context-plugin.ts` criado
- [ ] Middleware registrado em todas as rotas
- [ ] Workers propagam correlation IDs
- [ ] Logs incluem requestId, clientId, caseId, tenantId
- [ ] Testes unitários para request context
- [ ] Documentação de logging atualizada

## 🎯 Milestone
**Fase 1: Preparação para Produção MVP** - Semana 2

## ⏱️ Estimativa
**3-4 horas** (implementação + testes + validação)
