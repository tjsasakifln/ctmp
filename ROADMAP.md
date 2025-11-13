# ROADMAP - Sistema de Atendimento Jurídico por WhatsApp

**Objetivo:** Transformar o MVP atual em um sistema enterprise-grade pronto para produção.

**Timeline Total:** 3-6 meses
**Status Atual:** MVP funcional com mocks
**Meta:** Sistema multi-tenant em produção para escritórios jurídicos com 1.000-10.000 clientes

---

## 📊 Visão Geral

```
MVP Atual → Produção MVP → Integrações Reais → Multi-tenant → Enterprise → Scale
   (✅)         (4 sem)         (6 sem)           (4 sem)        (4 sem)    (contínuo)
```

### Stack Tecnológica
- **Backend:** Node.js 20 + Fastify + TypeScript
- **Database:** PostgreSQL (Supabase) + Drizzle ORM
- **Jobs:** BullMQ + Redis
- **WhatsApp:** WhatsApp Business Cloud API
- **Deploy:** Railway → Kubernetes (quando necessário)

---

## 🎯 Fase 0: MVP Atual (✅ Completo)

**Status:** Implementado e funcional
**Tempo:** N/A

### ✅ Funcionalidades Implementadas
- [x] Webhook WhatsApp com verificação
- [x] Identificação automática de clientes
- [x] Consulta DataJud/DJEN (mocks)
- [x] Tradutor de juridiquês (dicionário determinístico)
- [x] Endpoints HTTP para Agent Builder
- [x] Jobs BullMQ para notificações diárias
- [x] Logs estruturados com Pino
- [x] Rate limiting básico
- [x] Testes unitários (Vitest)
- [x] Docker Compose (dev)

### 📦 Entregáveis Existentes
- Código-fonte em `apps/backend/`
- Documentação completa (README.md, QUICKSTART.md, TESTING.md)
- Scripts de seed e migração
- Providers mock (DataJud, DJEN, Payments, Calendar)

---

## 🚀 Fase 1: Preparação para Produção MVP

**Objetivo:** Hardening do MVP para deploy inicial em produção
**Tempo Estimado:** 4 semanas
**Pré-requisitos:** Fase 0 completa

### Semana 1: Infraestrutura Base

#### 1.1 Setup Railway
- [ ] Criar conta Railway e projeto
- [ ] Configurar 3 serviços iniciais:
  - [ ] `api` - Servidor Fastify (PORT 3000)
  - [ ] `worker` - BullMQ workers
  - [ ] `scheduler` - Cron jobs
- [ ] Provisionar PostgreSQL managed (Railway plugin)
- [ ] Provisionar Redis managed (Railway plugin)
- [ ] Configurar variáveis de ambiente por serviço
- [ ] Testar conectividade entre serviços

#### 1.2 Configuração de Domínio
- [ ] Registrar domínio (ex: legalbot.com.br)
- [ ] Configurar DNS apontando para Railway
- [ ] Configurar SSL/TLS automático (Railway)
- [ ] Validar certificado HTTPS

#### 1.3 CI/CD Pipeline

**Workflows Criados:**
- [x] Criar workflow GitHub Actions `.github/workflows/ci.yml`:
  - [x] Job: `lint` (ESLint)
  - [x] Job: `test` (Vitest)
  - [x] Job: `build` (TypeScript compilation)
  - [x] Job: `security-audit` (npm audit)
- [x] Criar workflow deploy `.github/workflows/deploy-staging.yml`:
  - [x] Trigger: push to `main`
  - [x] Deploy automático para staging
  - [x] Smoke tests pós-deploy
- [x] Criar workflow deploy `.github/workflows/deploy-production.yml`:
  - [x] Trigger: tag `v*.*.*`
  - [x] Deploy manual para production (approval required)
  - [x] Pre-deployment checks
  - [x] Post-deployment validation

**Correções Necessárias:**
- [ ] Migrar `.eslintrc.json` para `eslint.config.js` (ESLint v9 compatibility) - **BLOCKER**
- [ ] Validar que `npm run lint` funciona localmente
- [ ] Validar que `npm test` funciona localmente
- [ ] Validar que `npm run build` funciona localmente
- [ ] Testar CI workflow em PR de teste

**Configuração Pendente:**
- [ ] Configurar GitHub Environments (staging, production)
- [ ] Configurar GitHub Secrets (Railway tokens, URLs)
- [ ] Configurar Railway GitHub integration
- [ ] Criar projetos Railway (staging, production)

**⚠️ Status Real:** Workflows criados mas **NÃO VALIDADOS**. ESLint v9 config quebrado vai causar falha no CI. Requer issues #[TBD] para tornar executável.

**Estimativa para completar:** 4-6h (correção ESLint + validação + configuração)

### Semana 2: Observabilidade

#### 2.1 Logs Estruturados
- [ ] Configurar Pino para produção (JSON format)
- [ ] Adicionar correlation IDs em todos os logs:
  - [ ] `requestId` - ID único da request
  - [ ] `clientId` - ID do cliente (quando disponível)
  - [ ] `caseId` - ID do processo (quando disponível)
  - [ ] `tenantId` - ID do tenant (preparação futura)
- [ ] Configurar log rotation (Railway Volumes)
- [ ] Remover logs sensíveis (tokens, senhas, CPF completo)

#### 2.2 Métricas
- [ ] Criar endpoint `/metrics` (formato Prometheus)
- [ ] Implementar métricas customizadas:
  - [ ] `http_requests_total` - Total de requests por rota
  - [ ] `http_request_duration_seconds` - Latência das requests
  - [ ] `whatsapp_messages_received_total` - Mensagens recebidas
  - [ ] `whatsapp_messages_sent_total` - Mensagens enviadas
  - [ ] `queue_jobs_total` - Jobs enfileirados por tipo
  - [ ] `queue_jobs_duration_seconds` - Tempo de processamento
  - [ ] `external_api_calls_total` - Chamadas às APIs externas
  - [ ] `external_api_errors_total` - Erros em APIs externas
- [ ] Configurar Grafana Cloud (free tier)
- [ ] Criar dashboard básico em Grafana

#### 2.3 Alertas
- [ ] Configurar alertas no Grafana:
  - [ ] API error rate > 5% (5 minutos)
  - [ ] Queue depth > 1000 jobs
  - [ ] Database connections > 80%
  - [ ] External API success rate < 90%
  - [ ] Disk usage > 85%
- [ ] Integrar Discord/Slack webhook para notificações
- [ ] Criar runbook de resposta a incidentes

### Semana 3: Segurança & Compliance

#### 3.1 Hardening de Segurança
- [ ] Instalar e configurar Helmet.js (security headers)
- [ ] Configurar CORS adequadamente:
  - [ ] Whitelist de origens permitidas
  - [ ] Credentials habilitado apenas para domínios confiáveis
- [ ] Implementar rate limiting por IP:
  - [ ] Webhook: 100 req/min
  - [ ] API Tools: 100 req/min
  - [ ] Admin endpoints: 50 req/min
- [ ] Adicionar request ID tracking
- [ ] Sanitizar inputs com Zod (revisar todos os endpoints)
- [ ] Validar webhook signature do WhatsApp (HMAC)

#### 3.2 Secrets Management
- [ ] Migrar secrets para Railway environment variables
- [ ] Remover hardcoded secrets do código
- [ ] Criar `.env.example` atualizado sem valores reais
- [ ] Documentar todas as variáveis obrigatórias

#### 3.3 Audit Logging (Preparação)
- [ ] Criar schema de tabela `audit_logs`:
  ```sql
  CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    user_id UUID,
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX idx_audit_created ON audit_logs(created_at);
  CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
  ```
- [ ] Implementar helper `auditLog(action, resource, metadata)`
- [ ] Adicionar audit em operações críticas:
  - [ ] Criação de cliente
  - [ ] Atualização de NUP
  - [ ] Envio de notificação
  - [ ] Acesso a dados sensíveis

### Semana 4: Testes & Validação

#### 4.1 Testes de Integração
- [ ] Criar testes E2E com supertest:
  - [ ] `POST /webhooks/whatsapp` - Receber mensagem
  - [ ] `POST /tools/consulta_datajud` - Consulta mock
  - [ ] `POST /tools/buscar_cliente_por_whatsapp` - Busca cliente
  - [ ] `GET /healthz` - Health check
  - [ ] `GET /readyz` - Readiness check
- [ ] Adicionar testes de workers:
  - [ ] Worker DJEN processa job
  - [ ] Worker DataJud processa job
  - [ ] Worker notificação envia mensagem
- [ ] Validar idempotência (replay de mensagens)

#### 4.2 Load Testing
- [ ] Instalar k6 (`npm install -g k6`)
- [ ] Criar script de load test `tests/load/webhook-load.js`:
  - [ ] Simular 100 mensagens/min
  - [ ] Validar p95 latency < 500ms
  - [ ] Validar error rate < 1%
- [ ] Executar load test em staging
- [ ] Documentar resultados e bottlenecks

#### 4.3 Deploy em Staging
- [ ] Deploy staging via CI/CD
- [ ] Executar smoke tests manuais:
  - [ ] Enviar mensagem de teste via ngrok
  - [ ] Verificar logs no Railway
  - [ ] Consultar banco via Drizzle Studio
  - [ ] Testar ferramentas HTTP com Postman/cURL
- [ ] Validar workers processando jobs
- [ ] Validar notificações diárias (job 08:00)

#### 4.4 Documentação
- [ ] Atualizar README.md com:
  - [ ] Instruções de deploy Railway
  - [ ] Variáveis de ambiente de produção
  - [ ] Troubleshooting comum
- [ ] Criar DEPLOYMENT.md:
  - [ ] Passo a passo de deploy
  - [ ] Rollback procedure
  - [ ] Health check checklist
- [ ] Criar MONITORING.md:
  - [ ] Acesso ao Grafana
  - [ ] Dashboards disponíveis
  - [ ] Como responder a alertas

### ✅ Critérios de Sucesso - Fase 1
- [ ] Sistema deployado em staging Railway
- [ ] CI/CD funcional (lint → test → deploy)
- [ ] Logs estruturados visíveis no Railway
- [ ] Grafana dashboard mostrando métricas
- [ ] Load test passa (100 msg/min, p95 < 500ms)
- [ ] Documentação completa atualizada

---

## 🔌 Fase 2: Integrações Reais

**Objetivo:** Substituir mocks por APIs reais (DJEN, DataJud, Payments, Calendar)
**Tempo Estimado:** 6 semanas
**Pré-requisitos:** Fase 1 completa

### Semana 5-6: Integração DJEN (Tribunais)

#### 5.1 Pesquisa de APIs Disponíveis
- [ ] Mapear APIs públicas dos tribunais:
  - [ ] TJSC - https://busca.tjsc.jus.br/
  - [ ] TJSP - https://dje.tjsp.jus.br/cdje/
  - [ ] TJRJ - Verificar disponibilidade
  - [ ] TJRS - Verificar disponibilidade
  - [ ] TJMG - Verificar disponibilidade
- [ ] Verificar se existe API oficial ou necessita scraping
- [ ] Analisar robots.txt de cada tribunal
- [ ] Documentar limitações e rate limits

#### 5.2 Implementação DJEN HTTP Provider
- [ ] Criar `apps/shared/adapters/djen/http/` com estrutura:
  ```
  http/
  ├── scrapers/
  │   ├── tjsc-scraper.ts
  │   ├── tjsp-scraper.ts
  │   └── base-scraper.ts
  ├── http-provider.ts
  └── index.ts
  ```
- [ ] Implementar scraper base com Playwright/Puppeteer:
  - [ ] Puppeteer headless mode
  - [ ] User-agent realista
  - [ ] Retry exponencial (3 tentativas)
  - [ ] Timeout configurável (30s default)
  - [ ] Rate limiting (max 10 req/min por tribunal)
- [ ] Implementar TJSC scraper
- [ ] Implementar TJSP scraper
- [ ] Adicionar cache Redis (TTL 24h)
- [ ] Criar testes de integração com casos reais

#### 5.3 DJEN Provider Configuration
- [ ] Adicionar variáveis de ambiente:
  ```env
  DJEN_PROVIDER=http
  DJEN_CACHE_TTL_HOURS=24
  DJEN_RATE_LIMIT_PER_MIN=10
  DJEN_TIMEOUT_MS=30000
  ```
- [ ] Implementar fallback para mock se scraping falhar
- [ ] Adicionar métricas específicas:
  - [ ] `djen_scraping_duration_seconds`
  - [ ] `djen_scraping_errors_total`
  - [ ] `djen_cache_hits_total`
- [ ] Documentar em `docs/integrations/djen.md`

### Semana 7-9: Integração DataJud (CNJ)

#### 7.1 Credenciamento CNJ
- [ ] Acessar https://www.cnj.jus.br/sistemas/datajud/
- [ ] Preparar documentação necessária:
  - [ ] CNPJ da empresa
  - [ ] Procuração (se aplicável)
  - [ ] Termo de adesão assinado
- [ ] Submeter solicitação de credenciamento
- [ ] **AGUARDAR APROVAÇÃO (2-4 semanas)**
- [ ] Receber credenciais (API key + secret)

#### 7.2 DataJud HTTP Provider (Paralelamente ao credenciamento)
- [ ] Estudar documentação oficial DataJud API
- [ ] Criar `apps/shared/adapters/datajud/http-provider.ts`
- [ ] Implementar OAuth2 flow (CNJ authentication):
  - [ ] Token endpoint
  - [ ] Token refresh automático
  - [ ] Token storage em Redis
- [ ] Implementar endpoints DataJud:
  - [ ] `POST /processos/consulta` - Consulta por NUP
  - [ ] `GET /movimentacoes/:nup` - Movimentações do processo
- [ ] Adicionar rate limiting respeitando quota CNJ (500/dia)
- [ ] Implementar cache inteligente:
  - [ ] Cache por NUP (TTL 6 horas)
  - [ ] Invalidação em caso de nova movimentação
- [ ] Criar métricas:
  - [ ] `datajud_api_calls_total`
  - [ ] `datajud_quota_remaining`
  - [ ] `datajud_auth_failures_total`

#### 7.3 Plano B: API Alternativa
**Caso CNJ demore > 4 semanas ou negue acesso**
- [ ] Avaliar APIs alternativas:
  - [ ] Jusbrasil API (comercial, ~R$0.50/consulta)
  - [ ] Projuris API
  - [ ] Outras opções
- [ ] Negociar contrato piloto (1-3 meses)
- [ ] Implementar provider alternativo
- [ ] Atualizar configuração:
  ```env
  DATAJUD_PROVIDER=jusbrasil
  DATAJUD_API_KEY=xxx
  DATAJUD_API_URL=https://api.jusbrasil.com.br
  ```

#### 7.4 Testes com Dados Reais
- [ ] Sandbox CNJ ou API alternativa
- [ ] Testar com 10 NUPs reais
- [ ] Validar parsing de movimentações
- [ ] Comparar com mock (consistency check)
- [ ] Documentar edge cases encontrados

### Semana 10: Integração Pagamentos

#### 10.1 Escolha do Gateway
- [ ] Avaliar opções:
  - [ ] Stripe (internacional, taxas ~3.9%)
  - [ ] Mercado Pago (Brasil, taxas ~4.99%)
  - [ ] PagSeguro
  - [ ] Outros
- [ ] Criar conta de desenvolvimento
- [ ] Obter API keys de teste

#### 10.2 Payment Provider Implementation
- [ ] Criar `apps/shared/adapters/payments/stripe-provider.ts`
- [ ] Implementar métodos:
  - [ ] `createCheckoutSession(amount, description, metadata)`
  - [ ] `validateWebhook(payload, signature)`
  - [ ] `refund(paymentId, amount?)`
- [ ] Configurar webhook endpoint `POST /webhooks/payments`:
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.failed`
  - [ ] `charge.refunded`
- [ ] Adicionar tabela `payments`:
  ```sql
  CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(20) NOT NULL, -- pending, succeeded, failed, refunded
    gateway VARCHAR(20) NOT NULL, -- stripe, mercadopago
    gateway_payment_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX idx_payments_client ON payments(client_id);
  CREATE INDEX idx_payments_status ON payments(status);
  ```
- [ ] Implementar reconciliação automática (payment → banco)
- [ ] Testar fluxo completo em ambiente sandbox

#### 10.3 Invoice Generation
- [ ] Instalar Puppeteer + template engine (Handlebars)
- [ ] Criar template PDF de cobrança `templates/invoice.hbs`
- [ ] Implementar função `generateInvoicePDF(payment)`
- [ ] Armazenar PDFs em Railway Volume ou S3
- [ ] Enviar invoice por email (SendGrid)

### Semana 11: Integração Google Calendar

#### 11.1 Google Cloud Setup
- [ ] Criar projeto no Google Cloud Console
- [ ] Habilitar Google Calendar API
- [ ] Criar Service Account:
  - [ ] Download JSON credentials
  - [ ] Armazenar como secret Railway
- [ ] Criar calendário compartilhado para agendamentos
- [ ] Dar permissão ao Service Account

#### 11.2 Calendar Provider Implementation
- [ ] Instalar `googleapis` package
- [ ] Criar `apps/shared/adapters/calendar/google-provider.ts`
- [ ] Implementar métodos:
  - [ ] `getAvailableSlots(dateRange)` - Horários livres
  - [ ] `bookSlot(clientId, datetime, metadata)` - Agendar
  - [ ] `cancelAppointment(appointmentId)` - Cancelar
- [ ] Adicionar tabela `appointments`:
  ```sql
  CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(20) NOT NULL, -- scheduled, completed, cancelled, no_show
    google_event_id VARCHAR(255),
    meeting_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX idx_appointments_client ON appointments(client_id);
  CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
  ```
- [ ] Implementar confirmação por email (SendGrid)
- [ ] Adicionar lembrete WhatsApp (24h antes)

#### 11.3 Email Service (SendGrid)
- [ ] Criar conta SendGrid (free tier 100 emails/dia)
- [ ] Verificar domínio (SPF/DKIM)
- [ ] Criar templates de email:
  - [ ] Confirmação de agendamento
  - [ ] Lembrete 24h antes
  - [ ] Cobrança gerada
  - [ ] Pagamento confirmado
- [ ] Implementar `apps/shared/adapters/email/sendgrid-provider.ts`
- [ ] Testar envios

### ✅ Critérios de Sucesso - Fase 2
- [ ] DJEN funcionando com pelo menos 2 tribunais (TJSC + TJSP)
- [ ] DataJud integrado (CNJ ou alternativa) com 10+ consultas reais
- [ ] Pagamentos funcionando em sandbox (Stripe/Mercado Pago)
- [ ] Google Calendar agendando e enviando convites
- [ ] Emails transacionais sendo enviados
- [ ] Métricas de todas integrações no Grafana
- [ ] Documentação completa em `docs/integrations/`

---

## 🏢 Fase 3: Multi-tenancy & White-label

**Objetivo:** Preparar sistema para múltiplos escritórios jurídicos isolados
**Tempo Estimado:** 4 semanas
**Pré-requisitos:** Fase 2 completa

### Semana 12-13: Database Multi-tenancy

#### 12.1 Schema Refactor
- [ ] Criar tabela `tenants`:
  ```sql
  CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    logo_url TEXT,
    primary_color VARCHAR(7),
    subscription_plan VARCHAR(50) DEFAULT 'starter',
    subscription_status VARCHAR(20) DEFAULT 'trial',
    max_clients INTEGER DEFAULT 100,
    max_api_calls_per_day INTEGER DEFAULT 1000,
    features JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX idx_tenants_slug ON tenants(slug);
  ```
- [ ] Adicionar `tenant_id` em TODAS as tabelas existentes:
  - [ ] `clients` + FK + index
  - [ ] `cases` + FK + index
  - [ ] `notifications` + FK + index
  - [ ] `payments` + FK + index
  - [ ] `appointments` + FK + index
  - [ ] `audit_logs` + FK + index
- [ ] Criar migration de backfill (assign default tenant)
- [ ] Habilitar Row Level Security (RLS):
  ```sql
  ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
  CREATE POLICY tenant_isolation ON clients
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
  -- Repetir para todas as tabelas
  ```

#### 12.2 Application Layer Multi-tenancy
- [ ] Criar middleware `tenantContext` em Fastify:
  - [ ] Extrair `tenant_id` de JWT ou subdomain
  - [ ] Injetar em `request.tenant`
  - [ ] Setar `app.current_tenant` no Postgres
- [ ] Atualizar todos os queries Drizzle:
  - [ ] Adicionar filtro `.where(eq(table.tenant_id, tenantId))`
  - [ ] Criar helper `withTenant(query, tenantId)`
- [ ] Criar testes de isolamento:
  - [ ] Tenant A não pode acessar dados do Tenant B
  - [ ] Admin endpoints requerem super_admin role

#### 12.3 Tenant Management API
- [ ] Criar rotas admin em `apps/api/src/routes/admin/`:
  - [ ] `POST /admin/tenants` - Criar tenant
  - [ ] `GET /admin/tenants` - Listar (super admin only)
  - [ ] `GET /admin/tenants/:id` - Detalhes
  - [ ] `PATCH /admin/tenants/:id` - Atualizar configuração
  - [ ] `DELETE /admin/tenants/:id` - Soft delete
- [ ] Implementar provisioning automático:
  - [ ] Criar tenant no banco
  - [ ] Setup inicial (criar usuário admin)
  - [ ] Enviar email de boas-vindas
  - [ ] Logar audit trail

### Semana 14-15: Autenticação & Autorização (RBAC)

#### 14.1 Sistema de Auth
- [ ] Escolher solução de auth:
  - [ ] **Opção A:** Clerk.com (managed, fácil, $25/mês)
  - [ ] **Opção B:** Auth.js (self-hosted, free)
  - [ ] **Opção C:** Implementar JWT custom
- [ ] Implementar escolha selecionada
- [ ] Criar tabela `users`:
  ```sql
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL, -- super_admin, tenant_admin, lawyer, readonly
    password_hash TEXT, -- se auth custom
    auth_provider VARCHAR(20), -- clerk, auth_js, custom
    auth_provider_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX idx_users_tenant ON users(tenant_id);
  CREATE INDEX idx_users_email ON users(email);
  ```
- [ ] Implementar middleware de autenticação
- [ ] Implementar RBAC helper `requireRole(['lawyer', 'admin'])`

#### 14.2 Roles & Permissions
- [ ] Definir matriz de permissões:
  | Role | Clients | Cases | Notifications | Payments | Settings | Users |
  |------|---------|-------|---------------|----------|----------|-------|
  | `super_admin` | All tenants | All | All | All | All | All |
  | `tenant_admin` | CRUD | CRUD | View/Send | View | Edit | CRUD |
  | `lawyer` | View/Edit | View/Edit | View | View | - | - |
  | `readonly` | View | View | View | - | - | - |
- [ ] Implementar decorators `@RequireRole()` ou guards
- [ ] Adicionar audit log em operações privilegiadas

### Semana 15: White-label Customization

#### 15.1 Branding Storage
- [ ] Setup Railway Volume para uploads ou S3 bucket
- [ ] Criar endpoint `POST /admin/tenants/:id/logo`:
  - [ ] Upload de imagem (validar: PNG/JPG, max 2MB)
  - [ ] Redimensionar para 200x200px (sharp package)
  - [ ] Armazenar e retornar URL
- [ ] Criar endpoint `PATCH /admin/tenants/:id/branding`:
  - [ ] `primary_color` (hex color, validar formato)
  - [ ] `secondary_color`
  - [ ] `font_family`

#### 15.2 Template Customization
- [ ] Permitir customização de templates WhatsApp:
  - [ ] Tabela `message_templates`:
    ```sql
    CREATE TABLE message_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id),
      template_key VARCHAR(50) NOT NULL, -- welcome, notification, reminder
      template_text TEXT NOT NULL,
      variables JSONB, -- {client_name}, {nup}, etc
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE UNIQUE INDEX idx_templates_tenant_key
      ON message_templates(tenant_id, template_key);
    ```
  - [ ] Implementar parser de variáveis `{variable_name}`
  - [ ] UI para editar templates (próxima fase)

#### 15.3 Domain Customization (Opcional)
- [ ] Documentar setup de custom domain no Railway
- [ ] Criar guia para tenant configurar:
  - [ ] CNAME record apontando para Railway
  - [ ] SSL certificate automático
- [ ] Implementar tenant resolution por domain:
  - [ ] Middleware detecta domain do request
  - [ ] Resolve tenant_id correspondente

### ✅ Critérios de Sucesso - Fase 3
- [ ] Múltiplos tenants funcionando em staging
- [ ] Isolamento de dados validado (testes automatizados)
- [ ] Auth funcional com roles (admin, lawyer, readonly)
- [ ] Logo e cores customizadas por tenant
- [ ] Templates WhatsApp editáveis
- [ ] API admin completa e documentada

---

## 🎨 Fase 4: Admin Dashboard (Frontend)

**Objetivo:** Interface web para gestão do sistema
**Tempo Estimado:** 4 semanas
**Pré-requisitos:** Fase 3 completa

### Semana 16-17: Setup & Core UI

#### 16.1 Projeto Frontend
- [ ] Criar `apps/dashboard/` com Vite + React + TypeScript
- [ ] Instalar dependências:
  - [ ] shadcn/ui (componentes)
  - [ ] TanStack Query (data fetching)
  - [ ] Zustand ou Jotai (state management)
  - [ ] React Router v6 (routing)
  - [ ] Recharts (gráficos)
- [ ] Configurar Tailwind CSS
- [ ] Setup Railway para deploy estático

#### 16.2 Autenticação Frontend
- [ ] Integrar com Clerk/Auth.js
- [ ] Criar páginas:
  - [ ] `/login` - Login form
  - [ ] `/signup` - Cadastro (apenas super admin inicialmente)
  - [ ] `/forgot-password` - Recovery
- [ ] Implementar protected routes
- [ ] Criar layout base com sidebar

#### 16.3 Dashboard Home
- [ ] Página `/dashboard`:
  - [ ] KPIs cards:
    - [ ] Total de clientes
    - [ ] Processos monitorados
    - [ ] Notificações enviadas (24h/7d/30d)
    - [ ] Taxa de sucesso de APIs externas
  - [ ] Gráfico: Notificações por dia (últimos 30 dias)
  - [ ] Gráfico: Clientes ativos vs inativos
  - [ ] Lista de atividade recente (últimas 10 ações)
- [ ] Implementar data fetching com TanStack Query
- [ ] Criar skeleton loaders

### Semana 18: CRUD Interfaces

#### 18.1 Clientes
- [ ] Página `/clients`:
  - [ ] Tabela com filtros (nome, telefone, status)
  - [ ] Paginação (50 por página)
  - [ ] Botão "Adicionar Cliente"
- [ ] Página `/clients/:id`:
  - [ ] Detalhes do cliente
  - [ ] Processos associados
  - [ ] Histórico de notificações
  - [ ] Editar informações
- [ ] Modal de criação/edição

#### 18.2 Processos
- [ ] Página `/cases`:
  - [ ] Tabela com NUP, cliente, tribunal, status
  - [ ] Filtros e busca
- [ ] Página `/cases/:id`:
  - [ ] Detalhes do processo
  - [ ] Timeline de movimentações
  - [ ] Botão "Consultar Agora" (força refresh)
  - [ ] Associar/desassociar cliente

#### 18.3 Notificações
- [ ] Página `/notifications`:
  - [ ] Histórico de notificações enviadas
  - [ ] Filtros por cliente, período, status
  - [ ] Visualizar conteúdo da mensagem
  - [ ] Status de entrega (enviado, lido, erro)

### Semana 19: Settings & Admin

#### 19.1 Configurações do Tenant
- [ ] Página `/settings/general`:
  - [ ] Nome do escritório
  - [ ] Logo upload
  - [ ] Cores (color picker)
  - [ ] Informações de contato
- [ ] Página `/settings/integrations`:
  - [ ] WhatsApp (phone number, status)
  - [ ] DataJud (API status, quota remaining)
  - [ ] DJEN (tribunais habilitados)
  - [ ] Pagamentos (gateway, status)
  - [ ] Calendário (conectar Google)
- [ ] Página `/settings/templates`:
  - [ ] Editor de templates WhatsApp
  - [ ] Preview com variáveis substituídas
  - [ ] Salvar/resetar para padrão

#### 19.2 Gestão de Usuários
- [ ] Página `/settings/users`:
  - [ ] Lista de usuários do tenant
  - [ ] Convidar novo usuário (enviar email)
  - [ ] Editar role
  - [ ] Desativar/ativar usuário
- [ ] Implementar controle de acesso (role-based UI)

#### 19.3 Super Admin (se aplicável)
- [ ] Página `/admin/tenants`:
  - [ ] Lista de todos os tenants (super admin only)
  - [ ] Criar novo tenant
  - [ ] Editar plano/limites
  - [ ] Suspender/reativar
- [ ] Página `/admin/analytics`:
  - [ ] Métricas agregadas de todos os tenants
  - [ ] Revenue dashboard
  - [ ] Health status de serviços

### ✅ Critérios de Sucesso - Fase 4
- [ ] Dashboard funcional em staging com dados reais
- [ ] Todas as operações CRUD implementadas
- [ ] Auth funcionando (login, logout, role-based access)
- [ ] UI responsiva (desktop + tablet)
- [ ] Performance adequada (First Contentful Paint < 1.5s)
- [ ] Deploy automático via Railway

---

## 📈 Fase 5: Scale, Compliance & Production Launch

**Objetivo:** Sistema enterprise-ready para launch em produção
**Tempo Estimado:** 4 semanas
**Pré-requisitos:** Fases 1-4 completas

### Semana 20: LGPD Compliance

#### 20.1 Data Mapping & Policies
- [ ] Documentar mapa de dados pessoais:
  - [ ] Identificação: nome, CPF, telefone, email
  - [ ] Sensíveis: NUP (dados processuais)
  - [ ] Anonimizados: analytics agregados
- [ ] Criar política de retenção:
  - [ ] Dados ativos: enquanto processo ativo + 7 anos
  - [ ] Dados inativos: anonimização após 7 anos
  - [ ] Audit logs: 7 anos (requisito legal)
- [ ] Designar DPO (Data Protection Officer)

#### 20.2 LGPD Endpoints
- [ ] Implementar direitos do titular (LGPD Art. 18):
  - [ ] `GET /gdpr/data-export/:clientId` - Portabilidade
    - [ ] Retornar JSON com todos os dados do cliente
    - [ ] Incluir processos, notificações, pagamentos
  - [ ] `DELETE /gdpr/forget-me/:clientId` - Direito ao esquecimento
    - [ ] Validar se pode deletar (processos ativos)
    - [ ] Anonimizar dados (hash CPF, ofuscar nome)
    - [ ] Manter audit trail (compliance)
  - [ ] `GET /gdpr/consent-history/:clientId` - Transparência
    - [ ] Histórico de consentimentos
    - [ ] Evidências (WhatsApp message IDs)
- [ ] Criar tabela `consents`:
  ```sql
  CREATE TABLE consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    consent_type VARCHAR(50) NOT NULL, -- data_processing, marketing, ai_analysis
    granted BOOLEAN NOT NULL,
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    evidence_type VARCHAR(50), -- whatsapp_message, email, dashboard
    evidence_data JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] Implementar coleta de consentimento via WhatsApp
- [ ] Criar flow de opt-out (cliente envia "SAIR")

#### 20.3 Documentação Legal
- [ ] Redigir Privacy Policy (Política de Privacidade):
  - [ ] Dados coletados
  - [ ] Finalidade
  - [ ] Base legal (LGPD Art. 7)
  - [ ] Direitos do titular
  - [ ] Contato do DPO
- [ ] Redigir Terms of Service (Termos de Uso)
- [ ] Criar página `/legal/privacy` no dashboard
- [ ] Criar página `/legal/terms`
- [ ] Implementar incident response plan (data breach)

### Semana 21: Encryption & Advanced Security

#### 21.1 Encryption at Rest
- [ ] Habilitar pgcrypto no Postgres:
  ```sql
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
  ```
- [ ] Criar funções de encrypt/decrypt:
  ```sql
  CREATE OR REPLACE FUNCTION encrypt_data(data TEXT, key TEXT)
  RETURNS BYTEA AS $$
    SELECT pgp_sym_encrypt(data, key);
  $$ LANGUAGE SQL;
  ```
- [ ] Migrar campos sensíveis para encrypted:
  - [ ] `clients.cpf` → BYTEA encrypted
  - [ ] `clients.phone` → BYTEA encrypted (opcional)
- [ ] Gerar encryption key (Railway secret):
  ```bash
  openssl rand -base64 32
  ```
- [ ] Implementar helpers de app:
  - [ ] `encryptField(value)` usando encryption key
  - [ ] `decryptField(encrypted)` para leitura
- [ ] Testar performance de queries com campos encrypted

#### 21.2 Security Audit
- [ ] Instalar dependências de segurança:
  ```bash
  npm audit fix
  ```
- [ ] Executar OWASP ZAP scan (automated)
- [ ] Manual security checklist:
  - [ ] SQL Injection: validado (Drizzle ORM parameterizado)
  - [ ] XSS: sanitização de inputs (Zod)
  - [ ] CSRF: tokens em forms (frontend)
  - [ ] Rate limiting: habilitado
  - [ ] Secrets: nenhum no código (Railway env vars)
  - [ ] HTTPS: forçado (Railway)
  - [ ] Headers de segurança: Helmet configurado
  - [ ] Logs: sem dados sensíveis
- [ ] Documentar findings e remediation

#### 21.3 Penetration Testing (Opcional mas recomendado)
- [ ] Contratar firma de pentesting (ou fazer interno)
- [ ] Fornecer acesso ao ambiente staging
- [ ] Receber relatório de vulnerabilidades
- [ ] Priorizar e corrigir issues críticos/high
- [ ] Re-test após fixes

### Semana 22: Scalability & Performance

#### 22.1 Database Optimization
- [ ] Analisar slow queries (pg_stat_statements):
  ```sql
  SELECT * FROM pg_stat_statements
  ORDER BY total_exec_time DESC LIMIT 10;
  ```
- [ ] Adicionar indexes faltantes:
  - [ ] Analisar planos de execução (EXPLAIN ANALYZE)
  - [ ] Criar indexes compostos se necessário
- [ ] Configurar connection pooling (PgBouncer):
  - [ ] Railway managed PgBouncer ou externo
  - [ ] Pool size: 20-50 connections
- [ ] Setup read replicas (Railway):
  - [ ] Queries read-only → replica
  - [ ] Queries write → primary
  - [ ] Implementar no Drizzle ORM

#### 22.2 API Auto-scaling
- [ ] Configurar auto-scaling no Railway:
  - [ ] API service: min 2, max 8 instances
  - [ ] Worker service: min 3, max 10 instances
  - [ ] Trigger: CPU > 70% ou memory > 80%
- [ ] Testar scaling com load testing k6:
  - [ ] Cenário: 500 requests/min sustentado (10 min)
  - [ ] Validar auto-scale up
  - [ ] Validar auto-scale down após load
- [ ] Configurar health checks no Railway:
  - [ ] Liveness: `GET /healthz` (responde 200)
  - [ ] Readiness: `GET /readyz` (verifica DB + Redis)

#### 22.3 Caching Strategy
- [ ] Implementar Redis cache em endpoints:
  - [ ] `GET /clients/:id` - cache 5 min
  - [ ] `GET /cases/:id` - cache 10 min
  - [ ] `POST /tools/consulta_datajud` - cache 6 horas (por NUP)
- [ ] Implementar cache invalidation:
  - [ ] On update: delete cache key
  - [ ] On notification: invalidate related caches
- [ ] Adicionar métricas de cache hit rate

### Semana 23: Monitoring & Reliability

#### 23.1 Enhanced Monitoring
- [ ] Criar dashboards Grafana detalhados:
  - [ ] **Dashboard 1:** API Performance
    - [ ] Latência p50/p95/p99 por endpoint
    - [ ] Error rate por endpoint
    - [ ] Requests/min
    - [ ] Status codes distribution
  - [ ] **Dashboard 2:** Workers & Queues
    - [ ] Queue depth por tipo (djen, datajud, notification)
    - [ ] Processing time p95
    - [ ] Failed jobs
    - [ ] Retry rate
  - [ ] **Dashboard 3:** Database
    - [ ] Active connections
    - [ ] Query duration p95
    - [ ] Cache hit rate
    - [ ] Replication lag (se usar replicas)
  - [ ] **Dashboard 4:** Business Metrics
    - [ ] Clientes ativos por tenant
    - [ ] Notificações enviadas (24h/7d/30d)
    - [ ] Taxa de sucesso APIs externas
    - [ ] Revenue (se aplicável)

#### 23.2 Alerting Rules (Revisão)
- [ ] Configurar alertas críticos:
  - [ ] **P0 (Pager):** API down (health check failing)
  - [ ] **P0:** Error rate > 10% (5 min)
  - [ ] **P1:** Database connections > 90%
  - [ ] **P1:** Queue depth > 5000 jobs
  - [ ] **P2:** API latency p95 > 1s
  - [ ] **P2:** External API success rate < 80%
  - [ ] **P2:** Disk usage > 85%
- [ ] Testar alertas (trigger manual)
- [ ] Configurar on-call rotation (PagerDuty ou similar)

#### 23.3 Disaster Recovery
- [ ] Configurar backups automáticos Railway:
  - [ ] PostgreSQL: daily snapshot + PITR (Point-in-Time Recovery)
  - [ ] Redis: RDB snapshots 6h
  - [ ] Volumes: daily backup
- [ ] Documentar recovery procedures:
  - [ ] RTO (Recovery Time Objective): 1 hora
  - [ ] RPO (Recovery Point Objective): 5 minutos
- [ ] Criar runbook `docs/runbooks/disaster-recovery.md`:
  - [ ] Restore do backup mais recente
  - [ ] Validar integridade dos dados
  - [ ] Redeploy de serviços
  - [ ] Smoke tests pós-recovery
- [ ] Executar DR drill (teste real):
  - [ ] Criar ambiente de teste
  - [ ] Restaurar backup
  - [ ] Validar funcionamento
  - [ ] Medir tempo de recovery

### Semana 24: Production Launch

#### 24.1 Pre-launch Checklist
- [ ] **Infraestrutura:**
  - [ ] Production environment configurado no Railway
  - [ ] Domínio configurado com SSL
  - [ ] Backups habilitados
  - [ ] Auto-scaling configurado
  - [ ] Monitoring & alerting ativos
- [ ] **Segurança:**
  - [ ] Security audit completo
  - [ ] LGPD compliance validado
  - [ ] Encryption at rest habilitado
  - [ ] Secrets rotacionados
  - [ ] WAF habilitado (Railway ou Cloudflare)
- [ ] **Integrações:**
  - [ ] WhatsApp Cloud API em produção (não test mode)
  - [ ] DJEN funcionando com tribunais reais
  - [ ] DataJud credenciado e testado
  - [ ] Pagamentos em modo live
  - [ ] Emails configurados (SendGrid verificado)
- [ ] **Aplicação:**
  - [ ] Todos os testes passando (unit + integration + E2E)
  - [ ] Load tests validados (1000 req/min)
  - [ ] Dashboard funcional
  - [ ] Documentação completa

#### 24.2 Soft Launch (Beta)
- [ ] Convidar 1 tenant pilot (escritório parceiro)
- [ ] Onboarding guiado:
  - [ ] Criar tenant
  - [ ] Configurar branding
  - [ ] Importar 10-50 clientes iniciais
  - [ ] Testar fluxos principais
- [ ] Monitorar de perto (24-48h):
  - [ ] Dashboards Grafana
  - [ ] Logs em tempo real
  - [ ] Feedback direto com usuários
- [ ] Coletar feedback e iterar

#### 24.3 Production Launch
- [ ] Comunicar go-live para stakeholders
- [ ] Deploy final via CI/CD (tag `v1.0.0`)
- [ ] Smoke tests pós-deploy:
  - [ ] Health checks
  - [ ] Enviar mensagem de teste via WhatsApp
  - [ ] Executar consulta DataJud/DJEN
  - [ ] Agendar compromisso teste
  - [ ] Gerar cobrança teste
- [ ] Ativar monitoring 24/7
- [ ] Publicar status page (opcional: status.io)

#### 24.4 Post-launch
- [ ] Monitorar primeiras 72h continuamente
- [ ] Documentar issues encontrados
- [ ] Criar tickets de melhorias baseados em feedback
- [ ] Celebrar! 🎉

### ✅ Critérios de Sucesso - Fase 5
- [ ] Sistema em produção com 1+ tenant ativo
- [ ] LGPD compliance 100% implementado
- [ ] Zero critical security issues
- [ ] SLA 99.9% uptime validado (primeiros 30 dias)
- [ ] Load handling 1000+ req/min sem degradação
- [ ] Documentação completa (técnica + legal)
- [ ] Equipe treinada em runbooks

---

## 🚀 Fase 6: Continuous Improvement (Pós-lançamento)

**Objetivo:** Melhorias contínuas e evolução do produto
**Timeline:** Ongoing

### High Priority (Próximos 1-3 meses)

#### Bulk Operations
- [ ] Importação em massa de clientes (CSV)
- [ ] Monitoramento bulk de processos
- [ ] Notificações em lote

#### AI Enhancements
- [ ] Expandir dicionário juridiquês (27 → 500+ termos)
- [ ] Fallback OpenAI GPT-4 para termos não mapeados
- [ ] Sentiment analysis (favorável/desfavorável)
- [ ] Urgency score (priorização de notificações)

#### Analytics
- [ ] Dashboard de analytics avançado
- [ ] Relatórios agendados (email semanal/mensal)
- [ ] Export de dados (CSV, Excel, PDF)
- [ ] Predictive analytics (tempo médio até sentença)

### Medium Priority (3-6 meses)

#### Mobile App
- [ ] App React Native para clientes
- [ ] Consulta de processos
- [ ] Recebimento de notificações push
- [ ] Agendamento de consultas

#### Multi-channel
- [ ] Telegram integration
- [ ] SMS notifications (Twilio)
- [ ] Email notifications como alternativa

#### Advanced Features
- [ ] OCR para upload de petições (DocumentAI)
- [ ] Geração de petições com IA (GPT-4)
- [ ] Chatbot jurídico com RAG
- [ ] Integração com CRMs (Pipedrive, HubSpot)

### Infrastructure Evolution

#### Migration to Kubernetes (when needed)
**Triggers:**
- Railway hitting limits (> 8GB RAM per service)
- Need multi-region (latency requirements)
- Cost optimization at scale (> 10,000 clients)

**Migration Plan:**
- [ ] Create Helm charts for all services
- [ ] Setup K8s cluster (EKS/GKE/AKS)
- [ ] Deploy to K8s staging environment
- [ ] Load test K8s deployment
- [ ] Blue-green deploy to production
- [ ] Keep Railway as backup (1 month)
- [ ] Decommission Railway

**Estimated Effort:** 2-3 weeks with 1 DevOps engineer

---

## 📊 Success Metrics & KPIs

### Technical KPIs
- **Uptime:** 99.9% (8.76h downtime/year max)
- **API Latency:** p95 < 200ms
- **Queue Processing:** p95 < 5 minutes
- **External API Success Rate:** > 95%
- **Error Rate:** < 1%
- **Security Incidents:** 0

### Business KPIs
- **Clients Onboarded:** 1,000+ (first 3 months)
- **Processes Monitored:** 5,000+
- **Notifications Sent:** 10,000+
- **Customer Churn:** < 5%
- **NPS:** > 50

### Compliance KPIs
- **LGPD Framework:** 100% implemented
- **Data Breaches:** 0
- **ANPD Violations:** 0
- **Consent Coverage:** 100%
- **Audit Logs Retention:** 7 years

---

## 👥 Team & Resources

### Minimum Team (Phases 1-5)
- **1x Tech Lead / Architect** - Overall technical direction
- **2x Backend Engineers** - API, integrations, workers
- **1x Full-stack Engineer** - Dashboard + API
- **1x DevOps Engineer** - Infrastructure, CI/CD, monitoring
- **1x Legal/Compliance Consultant** - Part-time, LGPD guidance
- **1x QA Engineer** - Part-time (from Phase 3), testing

**Total:** 5.5 FTEs

### Recommended Team (if budget allows)
- Above +
- **1x Product Manager** - Roadmap, stakeholder management
- **1x UX/UI Designer** - Dashboard design, UX research
- **1x Data Engineer** - Analytics, BI dashboards

**Total:** 8.5 FTEs

---

## 💰 Budget Estimate

### Infrastructure (6 months)
- **Railway:** $200-500/month = $2,100
- **SendGrid:** $15/month = $90
- **Monitoring:** Grafana Cloud (free tier)
- **Auth:** Clerk.com $25/month = $150 (optional)
- **Total Infrastructure:** ~$2,500

### External Services (variable)
- **Stripe/Mercado Pago:** Transaction fees only
- **DataJud API:** Included (CNJ) or ~R$0.50/query (Jusbrasil)
- **Puppeteer/Playwright:** Infrastructure cost only

### Team (Brazil market rates, 6 months)
- **2x Backend:** R$15k/month each = R$180k
- **1x Full-stack:** R$18k/month = R$108k
- **1x DevOps:** R$20k/month = R$120k
- **1x Legal Consultant:** R$8k/month (part-time) = R$48k
- **1x QA:** R$6k/month (part-time, 4 months) = R$24k
- **Total Team:** R$480k (~$96k USD at 5:1 rate)

**Grand Total:** ~$100k USD (6 months)

---

## ⚠️ Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| CNJ credentialing delays (> 4 weeks) | High | High | Use third-party API (Jusbrasil) as fallback |
| DJEN has no public API | Medium | High | Implement ethical scrapers with legal validation |
| Railway scaling limits reached | Low | Medium | Document K8s migration path, trigger at 8GB RAM |
| LGPD compliance gaps | Medium | Critical | Hire legal consultant from Phase 1 |
| Team velocity below expected | High | High | Reduce scope: prioritize Phases 1-2 over 4-5 |
| WhatsApp rate limits | Medium | Medium | Implement queue backpressure, proactive monitoring |
| Security breach | Low | Critical | Follow security checklist, penetration testing |
| Key person dependency | Medium | High | Documentation, pair programming, knowledge sharing |

---

## 📚 Documentation Structure

```
docs/
├── api/
│   ├── openapi.yaml                    # API spec
│   └── webhooks.md                     # Webhook documentation
├── architecture/
│   ├── overview.md                     # System architecture
│   ├── database-schema.md              # ERD + schema docs
│   └── multi-tenancy.md                # Multi-tenancy design
├── integrations/
│   ├── whatsapp.md                     # WhatsApp Cloud API
│   ├── datajud.md                      # DataJud integration
│   ├── djen.md                         # DJEN scrapers
│   ├── payments.md                     # Stripe/Mercado Pago
│   └── calendar.md                     # Google Calendar
├── operations/
│   ├── deployment.md                   # Deploy procedures
│   ├── monitoring.md                   # Grafana dashboards
│   ├── disaster-recovery.md            # DR procedures
│   └── security.md                     # Security guidelines
├── compliance/
│   ├── lgpd.md                         # LGPD framework
│   ├── privacy-policy.md               # Privacy policy
│   └── terms-of-service.md             # Terms of service
└── runbooks/
    ├── api-down.md                     # API outage response
    ├── database-failover.md            # DB failover
    ├── high-queue-depth.md             # Queue backup
    └── security-incident.md            # Security incident response
```

---

## 🎯 Next Steps

1. **Review este roadmap** com stakeholders
2. **Priorizar fases** baseado em constraints de time/budget
3. **Montar equipe** (ou alocar recursos existentes)
4. **Setup ferramentas** (GitHub Projects, Linear, Jira)
5. **Kickoff Phase 1** com sprint planning
6. **Executar iterativamente** com revisões quinzenais

---

## 📝 Notas Finais

### Princípios de Desenvolvimento
1. **Ship early, ship often** - Releases frequentes em staging
2. **Security first** - Nunca comprometer em segurança
3. **Test thoroughly** - Cobertura > 80%, E2E críticos
4. **Document everything** - README, API docs, runbooks
5. **Monitor proactively** - Alertas antes que usuários reclamem
6. **Iterate based on feedback** - Soft launch → feedback → iterate

### Adaptabilidade
Este roadmap é um guia, não uma Bíblia. Ajuste conforme necessário baseado em:
- Feedback de usuários
- Limitações de recursos
- Mudanças regulatórias
- Oportunidades de mercado
- Evolução tecnológica

---

**Versão:** 1.0
**Última Atualização:** 2025-01-13
**Próxima Revisão:** Após conclusão de cada fase

**Boa sorte! 🚀**
