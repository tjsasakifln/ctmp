# Issue #6: Implement Prometheus Metrics Endpoint

## 🎯 Objetivo
Criar endpoint `/metrics` no formato Prometheus com métricas customizadas de negócio e técnicas para monitoramento em Grafana.

## 📋 Contexto
**Situação Atual:**
- Logging estruturado implementado (Issue #5)
- Nenhuma métrica exportada
- Impossível monitorar performance/saúde em tempo real
- Grafana não pode coletar métricas

**Impacto:**
- Monitoramento proativo de performance
- Alertas baseados em métricas (Grafana Alerts)
- Dashboards visuais de negócio e técnicos
- Detecção precoce de problemas

## ✅ Critérios de Aceitação

1. [ ] Endpoint `GET /metrics` implementado
2. [ ] Formato Prometheus válido (texto)
3. [ ] Métricas HTTP incluídas (requests, latência, errors)
4. [ ] Métricas de negócio incluídas (mensagens, notificações)
5. [ ] Métricas de infra incluídas (DB connections, queue depth)
6. [ ] Endpoint documentado em OpenAPI/Swagger
7. [ ] Performance: endpoint responde < 100ms
8. [ ] Testes automatizados para métricas críticas

## 🔧 Detalhes Técnicos

### Passo 1: Instalar Dependência

```bash
cd apps/backend
npm install prom-client
npm install -D @types/prom-client
```

**Package:** `prom-client` (biblioteca oficial Prometheus para Node.js)

### Passo 2: Criar Metrics Registry

**Arquivo:** `apps/backend/src/config/metrics.ts` (criar)

```typescript
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Criar registry global
export const register = new Registry();

// Coletar métricas default (CPU, memory, event loop, etc)
collectDefaultMetrics({ register, prefix: 'nodejs_' });

// ========================================
// MÉTRICAS HTTP
// ========================================

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total de requests HTTP recebidas',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requests HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5], // 10ms a 5s
  registers: [register],
});

// ========================================
// MÉTRICAS DE NEGÓCIO (WhatsApp)
// ========================================

export const whatsappMessagesReceived = new Counter({
  name: 'whatsapp_messages_received_total',
  help: 'Total de mensagens WhatsApp recebidas',
  labelNames: ['message_type'], // text, image, audio, etc
  registers: [register],
});

export const whatsappMessagesSent = new Counter({
  name: 'whatsapp_messages_sent_total',
  help: 'Total de mensagens WhatsApp enviadas',
  labelNames: ['status'], // success, failed
  registers: [register],
});

export const whatsappNotificationsSent = new Counter({
  name: 'whatsapp_notifications_sent_total',
  help: 'Total de notificações automáticas enviadas',
  labelNames: ['event_type'], // djen, datajud
  registers: [register],
});

// ========================================
// MÉTRICAS DE QUEUE (BullMQ)
// ========================================

export const queueJobsTotal = new Counter({
  name: 'queue_jobs_total',
  help: 'Total de jobs enfileirados',
  labelNames: ['queue_name', 'status'], // pending, completed, failed
  registers: [register],
});

export const queueJobDuration = new Histogram({
  name: 'queue_job_duration_seconds',
  help: 'Duração do processamento de jobs',
  labelNames: ['queue_name'],
  buckets: [0.1, 0.5, 1, 5, 10, 30, 60], // 100ms a 60s
  registers: [register],
});

export const queueDepth = new Gauge({
  name: 'queue_depth',
  help: 'Número de jobs pendentes na fila',
  labelNames: ['queue_name'],
  registers: [register],
});

// ========================================
// MÉTRICAS DE APIS EXTERNAS
// ========================================

export const externalApiCalls = new Counter({
  name: 'external_api_calls_total',
  help: 'Total de chamadas a APIs externas',
  labelNames: ['api_name', 'status'], // success, error, timeout
  registers: [register],
});

export const externalApiDuration = new Histogram({
  name: 'external_api_duration_seconds',
  help: 'Duração de chamadas a APIs externas',
  labelNames: ['api_name'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30], // 100ms a 30s
  registers: [register],
});

// ========================================
// MÉTRICAS DE DATABASE
// ========================================

export const databaseConnections = new Gauge({
  name: 'database_connections_active',
  help: 'Número de conexões ativas ao banco de dados',
  registers: [register],
});

export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duração de queries ao banco',
  labelNames: ['operation'], // select, insert, update, delete
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1], // 1ms a 1s
  registers: [register],
});

// ========================================
// MÉTRICAS DE NEGÓCIO (Clientes/Processos)
// ========================================

export const activeClients = new Gauge({
  name: 'active_clients_total',
  help: 'Número de clientes ativos',
  registers: [register],
});

export const monitoredCases = new Gauge({
  name: 'monitored_cases_total',
  help: 'Número de processos sendo monitorados',
  registers: [register],
});
```

### Passo 3: Middleware de Métricas HTTP

**Arquivo:** `apps/backend/src/config/metrics-plugin.ts` (criar)

```typescript
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { httpRequestsTotal, httpRequestDuration } from './metrics';

const metricsPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (request) => {
    // Marca início da request
    request.startTime = Date.now();
  });

  fastify.addHook('onResponse', async (request, reply) => {
    // Calcula duração
    const duration = (Date.now() - request.startTime) / 1000; // segundos

    const labels = {
      method: request.method,
      route: request.routeOptions?.url || request.url,
      status_code: reply.statusCode.toString(),
    };

    // Incrementa counter
    httpRequestsTotal.inc(labels);

    // Registra duração
    httpRequestDuration.observe(labels, duration);
  });
};

declare module 'fastify' {
  interface FastifyRequest {
    startTime: number;
  }
}

export default fp(metricsPlugin, {
  name: 'metrics',
  fastify: '4.x',
});
```

### Passo 4: Endpoint /metrics

**Arquivo:** `apps/backend/src/routes/metrics.ts` (criar)

```typescript
import { FastifyPluginAsync } from 'fastify';
import { register } from '../config/metrics';

export const metricsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/metrics', {
    schema: {
      description: 'Prometheus metrics endpoint',
      tags: ['Monitoring'],
      response: {
        200: {
          type: 'string',
          description: 'Metrics in Prometheus format',
        },
      },
    },
    handler: async (request, reply) => {
      reply.type('text/plain; version=0.0.4; charset=utf-8');
      return register.metrics();
    },
  });
};
```

### Passo 5: Registrar no Server

**Arquivo:** `apps/backend/src/index.ts`

```typescript
import metricsPlugin from './config/metrics-plugin';
import { metricsRoutes } from './routes/metrics';

// Registrar plugin de métricas
await fastify.register(metricsPlugin);

// Registrar rota /metrics
await fastify.register(metricsRoutes);
```

### Passo 6: Instrumentar Código

**Exemplo - WhatsApp Handler:**
```typescript
import { whatsappMessagesReceived } from '../../config/metrics';

export async function handleWhatsAppMessage(message: WhatsAppMessage) {
  // Incrementar métrica
  whatsappMessagesReceived.inc({
    message_type: message.type, // text, image, audio
  });

  // ... processar mensagem
}
```

**Exemplo - BullMQ Worker:**
```typescript
import { queueJobsTotal, queueJobDuration } from '../../config/metrics';

const worker = new Worker('send-notification', async (job) => {
  const startTime = Date.now();

  try {
    // ... processar job

    queueJobsTotal.inc({ queue_name: 'send-notification', status: 'completed' });
  } catch (error) {
    queueJobsTotal.inc({ queue_name: 'send-notification', status: 'failed' });
    throw error;
  } finally {
    const duration = (Date.now() - startTime) / 1000;
    queueJobDuration.observe({ queue_name: 'send-notification' }, duration);
  }
});
```

**Exemplo - External API:**
```typescript
import { externalApiCalls, externalApiDuration } from '../../config/metrics';

async function fetchDataJud(nup: string) {
  const startTime = Date.now();

  try {
    const response = await axios.get(`/api/datajud/${nup}`);
    externalApiCalls.inc({ api_name: 'datajud', status: 'success' });
    return response.data;
  } catch (error) {
    externalApiCalls.inc({ api_name: 'datajud', status: 'error' });
    throw error;
  } finally {
    const duration = (Date.now() - startTime) / 1000;
    externalApiDuration.observe({ api_name: 'datajud' }, duration);
  }
}
```

### Passo 7: Atualizar Gauges Periodicamente

**Arquivo:** `apps/backend/src/jobs/update-metrics-job.ts` (criar)

```typescript
import { activeClients, monitoredCases, queueDepth } from '../config/metrics';
import { clientRepository } from '../features/clients/repository';
import { caseRepository } from '../features/cases/repository';
import { notificationQueue, djenQueue, datajudQueue } from '../config/queues';

export async function updateBusinessMetrics() {
  // Contar clientes ativos
  const clientCount = await clientRepository.countActive();
  activeClients.set(clientCount);

  // Contar processos monitorados
  const caseCount = await caseRepository.countActive();
  monitoredCases.set(caseCount);

  // Queue depths
  const notificationDepth = await notificationQueue.count();
  queueDepth.set({ queue_name: 'send-notification' }, notificationDepth);

  const djenDepth = await djenQueue.count();
  queueDepth.set({ queue_name: 'check-djen' }, djenDepth);

  const datajudDepth = await datajudQueue.count();
  queueDepth.set({ queue_name: 'check-datajud' }, datajudDepth);
}

// Atualizar a cada 30s
setInterval(updateBusinessMetrics, 30000);
```

### Passo 8: Validação

**Testar endpoint:**
```bash
# Fazer requests
curl http://localhost:3000/healthz
curl http://localhost:3000/webhooks/whatsapp

# Verificar métricas
curl http://localhost:3000/metrics

# Exemplo de output esperado:
# HELP http_requests_total Total de requests HTTP recebidas
# TYPE http_requests_total counter
# http_requests_total{method="GET",route="/healthz",status_code="200"} 1
# http_requests_total{method="POST",route="/webhooks/whatsapp",status_code="200"} 1

# HELP http_request_duration_seconds Duração das requests HTTP
# TYPE http_request_duration_seconds histogram
# http_request_duration_seconds_bucket{method="GET",route="/healthz",status_code="200",le="0.01"} 1
# http_request_duration_seconds_sum{method="GET",route="/healthz",status_code="200"} 0.005
# http_request_duration_seconds_count{method="GET",route="/healthz",status_code="200"} 1
```

**Validar formato Prometheus:**
```bash
# Usar promtool (se disponível)
curl http://localhost:3000/metrics | promtool check metrics

# Ou validar online
curl http://localhost:3000/metrics > metrics.txt
# Upload em https://prometheus.io/docs/prometheus/latest/querying/examples/
```

## 📦 Dependências
- **Depende de:** Issue #5 (Correlation IDs úteis para debug de métricas)
- **Bloqueia:** Issue #7 (Grafana precisa deste endpoint)
- **Relacionado:** ROADMAP Fase 1, Semana 2, Tarefa 2.2

## 🏷️ Labels
- `priority: high`
- `type: feature`
- `area: observability`
- `effort: 4-6h`
- `phase: 1-week-2`

## 📚 Referências
- [prom-client npm](https://github.com/siimon/prom-client)
- [Prometheus Metric Types](https://prometheus.io/docs/concepts/metric_types/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
- ROADMAP.md - Fase 1, Semana 2

## ✍️ Notas para Implementação

**Best Practices:**
1. Nomes de métricas: snake_case, sufixo com unidade (_seconds, _total, _bytes)
2. Labels: baixa cardinalidade (não incluir IDs únicos)
3. Counter para valores que só crescem (requests, errors)
4. Gauge para valores que sobem/descem (connections, queue depth)
5. Histogram para distribuições (latência, duração)

**Cuidados:**
- Não expor dados sensíveis em labels (CPF, nomes, etc)
- Limitar cardinalidade de labels (< 10 valores diferentes)
- Performance: coletar métricas é barato, mas evitar locks

**Troubleshooting:**
- Se endpoint lento: verificar número de métricas (< 1000 OK)
- Se Grafana não coleta: verificar formato Prometheus válido
- Se métricas não incrementam: verificar instrumentação no código

## 🎯 Deliverables
- [ ] Endpoint `/metrics` funcionando
- [ ] Formato Prometheus válido
- [ ] 10+ métricas implementadas (HTTP, negócio, infra)
- [ ] Código instrumentado (handlers, workers, APIs)
- [ ] Testes para endpoint /metrics
- [ ] Documentação de métricas disponíveis

## 🎯 Milestone
**Fase 1: Preparação para Produção MVP** - Semana 2

## ⏱️ Estimativa
**4-6 horas** (setup + instrumentação + testes + documentação)
