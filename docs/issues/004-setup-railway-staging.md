# Issue #4: Setup Railway Staging Environment

## 🎯 Objetivo
Criar e configurar ambiente staging completo no Railway com PostgreSQL, Redis, e serviço API pronto para deploy.

## 📋 Contexto
**Situação Atual:**
- Nenhum ambiente Railway configurado
- Aplicação pronta para deploy
- CI workflow validado localmente

**Impacto:**
- Habilitar deploys automatizados de staging
- Ambiente de testes antes de produção
- Validação de integrações reais (DB, Redis, WhatsApp)

## ✅ Critérios de Aceitação

1. [ ] Projeto Railway "legalbot-staging" criado
2. [ ] PostgreSQL 16 provisionado e acessível
3. [ ] Redis 7 provisionado e acessível
4. [ ] Serviço "api" criado e configurado
5. [ ] Variáveis de ambiente configuradas
6. [ ] Domain público gerado e acessível
7. [ ] Migrations executadas com sucesso
8. [ ] Health check `/healthz` retorna 200
9. [ ] Readiness check `/readyz` retorna 200
10. [ ] Railway tokens gerados para CI

## 🔧 Detalhes Técnicos

### Passo 1: Criar Projeto Railway

1. Acesse https://railway.app/new
2. Click "Empty Project"
3. Nome: `legalbot-staging`
4. Region: `us-west1` (ou mais próxima do Brasil)

### Passo 2: Provisionar PostgreSQL

**Add Service → Database → PostgreSQL**

Configurações:
```yaml
Service Name: postgres-staging
Version: 16
Plan: Starter (free tier)
Volume: 1GB (sufficient for staging)
```

Após provisionar:
```bash
# Copiar DATABASE_URL (formato connection string)
# Exemplo: postgresql://postgres:***@postgres.railway.internal:5432/railway
```

### Passo 3: Provisionar Redis

**Add Service → Database → Redis**

Configurações:
```yaml
Service Name: redis-staging
Version: 7
Plan: Starter (free tier)
Volume: 256MB
```

Após provisionar:
```bash
# Copiar REDIS_URL (formato connection string)
# Exemplo: redis://default:***@redis.railway.internal:6379
```

### Passo 4: Criar Serviço API

**Add Service → GitHub Repo**

Seleção:
- Repository: `tjsasakifln/ctmp`
- Branch: `main`
- Root Directory: `apps/backend`

Configurações:
```yaml
Service Name: api-staging
Build Command: npm ci && npm run build
Start Command: npm start
Port: 3000 (detectado automaticamente)
Health Check Path: /healthz
Health Check Timeout: 30s
Instances: 1 (staging pode ter 1 apenas)
```

### Passo 5: Configurar Variáveis de Ambiente

**Service Settings → Variables**

```bash
# Node.js
NODE_ENV=production
PORT=3000

# Database (copiar do PostgreSQL service)
DATABASE_URL=${{postgres-staging.DATABASE_URL}}

# Redis (copiar do Redis service)
REDIS_URL=${{redis-staging.REDIS_URL}}

# WhatsApp Cloud API (valores de teste ou reais)
WHATSAPP_VERIFY_TOKEN=staging-verify-token-change-me
WHATSAPP_ACCESS_TOKEN=EAA... (token de teste do Meta)
WHATSAPP_PHONE_NUMBER_ID=123456789012345

# Providers (mock para staging inicial)
DATAJUD_PROVIDER=mock
DJEN_PROVIDER=mock
PAYMENTS_PROVIDER=mock
CALENDAR_PROVIDER=mock

# Features
FEATURE_AGENT_REWRITE=false
ENABLE_WORKERS=false # Desabilitado até Worker service

# Logging
LOG_LEVEL=info
```

**Referências entre serviços:**
Railway permite referenciar variáveis de outros serviços:
```
${{postgres-staging.DATABASE_URL}}
${{redis-staging.REDIS_URL}}
```

### Passo 6: Configurar Domain

**Service Settings → Domains → Generate Domain**

Railway vai gerar: `api-staging-production-xxxx.up.railway.app`

Anote esse domain para usar em:
- GitHub Secret `STAGING_URL`
- Testes de smoke
- Webhook do WhatsApp

### Passo 7: Deploy Inicial Manual

**Service → Deploy**

Esperar build + deploy (~3-5 min)

Verificar logs:
```
Build:
✓ npm ci (install dependencies)
✓ npm run build (compile TypeScript)

Deploy:
✓ npm start
✓ Server listening on port 3000
✓ Health check passed
```

### Passo 8: Executar Migrations

**Via Railway CLI:**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link ao projeto
railway link legalbot-staging

# Executar migrations
railway run --service api-staging "npm run db:migrate"

# Verificar tabelas criadas
railway run --service api-staging "npm run db:studio"
```

**Ou via UI:**
Service → Run Command:
```bash
npm run db:migrate
```

### Passo 9: Validar Deployment

**Health Checks:**
```bash
STAGING_URL="https://api-staging-production-xxxx.up.railway.app"

# Test health
curl ${STAGING_URL}/healthz
# Expected: {"ok":true,"status":"healthy"}

# Test readiness
curl ${STAGING_URL}/readyz
# Expected: {"ok":true,"checks":{"database":"healthy","redis":"healthy"}}

# Test webhook verification
curl "${STAGING_URL}/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=staging-verify-token-change-me&hub.challenge=test123"
# Expected: test123
```

### Passo 10: Gerar Tokens para CI

**Railway.app → Account Settings → Tokens**

Criar token:
- Name: `github-actions-staging`
- Scope: `Deploy` + `Read`
- Expires: 1 year

Copiar token para Issue #3 (GitHub Secrets)

**Obter Project ID:**
Railway project → Settings → Copy "Project ID"

## 📦 Dependências
- **Depende de:** Nenhuma (pode ser feita em paralelo)
- **Bloqueia:** Issue #3 (precisa dos tokens/IDs)
- **Bloqueia:** Primeiro deploy automatizado

## 🏷️ Labels
- `priority: high`
- `type: infrastructure`
- `area: deployment`
- `effort: 3-4h`
- `phase: 1-week-1`

## 📚 Referências
- [Railway Documentation](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Railway PostgreSQL](https://docs.railway.app/databases/postgresql)
- [Railway Redis](https://docs.railway.app/databases/redis)
- ROADMAP.md - Fase 1, Semana 1

## ✍️ Notas para Implementação

**Custos:**
- Starter plan é gratuito ($5 credit/mês)
- PostgreSQL + Redis + API = ~$5-10/mês em staging
- Suficiente para desenvolvimento

**Troubleshooting:**
- Se deploy falhar: verificar logs de build
- Se health check falhar: verificar PORT está correto
- Se DB connection falhar: verificar DATABASE_URL format
- Se variáveis não resolvem: usar ${SERVICE.VARIABLE} syntax

**Segurança:**
- Não expor credentials em logs
- Usar WHATSAPP_VERIFY_TOKEN forte (não "test123")
- Rotacionar tokens periodicamente

## 🎯 Deliverables
- [ ] Projeto Railway staging operacional
- [ ] URL pública acessível
- [ ] Health checks passando
- [ ] Railway token e Project ID documentados
- [ ] Screenshot do dashboard Railway
- [ ] Lista de variáveis de ambiente (SEM valores)

## 🎯 Milestone
**Fase 1: Preparação para Produção MVP** - Semana 1

## ⏱️ Estimativa
**3-4 horas** (setup + configuração + validação + troubleshooting)
