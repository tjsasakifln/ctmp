# Enterprise Roadmap: MVP → Enterprise (3-6 Meses)

**Data:** 2025-01-06
**Autor:** CTO
**Status:** Approved for Implementation
**Plataforma:** Railway → Kubernetes (migration path)

---

## Sumário Executivo

Transformação do MVP atual em sistema enterprise-grade para atender **single large law firm (1,000-10,000 clientes)** em **3-6 meses**, usando **Railway PaaS** como plataforma inicial com caminho de migração para Kubernetes quando necessário.

### Objetivos Principais

1. ✅ **Real judicial API integrations** - Substituir mocks por APIs DJEN/DataJud reais
2. ✅ **Multi-tenancy & white-label** - Suporte a múltiplos tenants com isolamento e branding
3. ✅ **Advanced security & compliance** - LGPD compliant, ISO 27001 prep, audit trails
4. ✅ **Scalability & high availability** - 99.9% uptime, auto-scaling, disaster recovery

### Decisões Arquiteturais

- **Railway first:** Deploy rápido, low DevOps overhead, cost-effective ($100-300/mês)
- **Monorepo multi-service:** API, Worker, Scheduler como serviços separados
- **PostgreSQL row-level security:** Multi-tenancy via `tenant_id` + RLS policies
- **Parallel tracks:** 3 workstreams concorrentes com integration milestones

---

## Arquitetura Target

```
┌─────────────────────────────────────────────────────────┐
│                    Railway Platform                      │
├─────────────────────────────────────────────────────────┤
│  API Service          Worker Service      Scheduler      │
│  (Fastify 3+ inst)    (BullMQ 5+ inst)   (Cron leader)  │
│  - REST endpoints     - DJEN checks       - Daily jobs   │
│  - WhatsApp webhook   - DataJud checks    - Cleanup      │
│  - Admin API          - Notifications     - Reports      │
│  - Health checks      - Document gen      - Analytics    │
├─────────────────────────────────────────────────────────┤
│  PostgreSQL (Managed)      Redis Cluster (Managed)       │
│  - Row-level security      - BullMQ queues               │
│  - Multi-tenant schema     - Rate limiting               │
│  - Replicas (read)         - Session cache               │
├─────────────────────────────────────────────────────────┤
│  Railway Volumes           Observability                 │
│  - Documents PDFs          - Railway Logs                │
│  - Audit logs             - Custom metrics (Prom)        │
│  - Backups                - Alerts (Discord/Slack)       │
└─────────────────────────────────────────────────────────┘
         ↓ External Integrations
┌─────────────────────────────────────────────────────────┐
│  CNJ DataJud API  │  DJEN APIs  │  WhatsApp  │  Payment │
└─────────────────────────────────────────────────────────┘
```

### Estrutura Monorepo

```bash
apps/
├── api/              # Main Fastify API (PORT 3000)
│   ├── src/
│   ├── Dockerfile
│   └── railway.json
├── worker/           # BullMQ workers (no HTTP)
│   ├── src/
│   ├── Dockerfile
│   └── railway.json
├── scheduler/        # Cron jobs (no HTTP)
│   ├── src/
│   ├── Dockerfile
│   └── railway.json
└── shared/           # Shared code
    ├── db/           # Drizzle schema, migrations
    ├── types/        # TypeScript types
    ├── utils/        # Validators, errors
    └── adapters/     # WhatsApp, DJEN, DataJud
```

---

## TRACK 1: Infrastructure Foundation (Railway)

**Owner:** DevOps/Platform Engineer
**Timeline:** Week 1-12 (parallel to other tracks)

### Week 1-2: Railway Setup & CI/CD

**Deliverables:**
- [ ] Railway project with 3 services (api, worker, scheduler)
- [ ] PostgreSQL + Redis managed plugins
- [ ] GitHub Actions CI/CD pipeline
  - PR: `lint` + `test` + `build`
  - Main: auto-deploy to staging
  - Tags: deploy to production
- [ ] Environment segregation (dev/staging/prod)
- [ ] Secrets management via Railway env vars

**Scripts:**
```json
{
  "scripts": {
    "deploy:staging": "railway up --environment staging",
    "deploy:prod": "railway up --environment production",
    "logs:api": "railway logs --service api",
    "logs:worker": "railway logs --service worker"
  }
}
```

---

### Week 3-4: Observability Stack

**Deliverables:**
- [ ] Structured logging (Pino) with correlation IDs
  - `requestId`, `tenantId`, `clientId`, `caseId`
- [ ] Custom metrics endpoint `/metrics` (Prometheus format)
- [ ] Grafana Cloud integration (free tier)
  - Dashboard: API performance
  - Dashboard: Worker queues
  - Dashboard: Database health
  - Dashboard: Business metrics
- [ ] Alerting rules
  - API error rate > 5%
  - Queue depth > 1000
  - DB connections > 80%
  - External API failures
- [ ] Discord/Slack webhook notifications

**Key Metrics:**
```typescript
// Business metrics
- active_clients_total
- processes_monitored_total
- notifications_sent_24h
- api_integration_success_rate

// Technical metrics
- http_request_duration_seconds
- queue_job_processing_duration_seconds
- database_query_duration_seconds
- external_api_call_duration_seconds
```

---

### Week 5-8: Security Hardening

**Deliverables:**
- [ ] JWT authentication (RS256)
- [ ] API key authentication for integrations
- [ ] RBAC implementation
  - Roles: `super_admin`, `tenant_admin`, `lawyer`, `client`, `readonly`
  - Permissions: `read`, `write`, `delete`, `manage_users`
- [ ] Encryption at rest (pgcrypto)
  - Fields: CPF, phone, sensitive case data
- [ ] Audit logging (immutable)
  - Who, what, when, from where
  - 7-year retention (LGPD requirement)
- [ ] Security headers (Helmet + CSP)
- [ ] Rate limiting per tenant (1000 req/min)

**Audit Log Schema:**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID,
  action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE
  resource_type VARCHAR(50),   -- client, case, notification
  resource_id UUID,
  metadata JSONB,              -- old/new values
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON clients
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

### Week 9-12: Scalability & High Availability

**Deliverables:**
- [ ] PostgreSQL read replicas (Railway)
- [ ] Connection pooling (PgBouncer)
- [ ] Redis Cluster mode (automatic failover)
- [ ] API auto-scaling
  - Min: 2 instances, Max: 8 instances
  - CPU threshold: 70%
- [ ] Worker auto-scaling
  - Min: 3 instances, Max: 10 instances
  - Queue depth trigger: > 500 jobs
- [ ] Database backup strategy
  - Railway automated backups (daily)
  - Manual snapshots before deploys
  - Point-in-time recovery (PITR)
- [ ] Disaster recovery runbook
  - RTO: 1 hour
  - RPO: 5 minutes
- [ ] Load testing (k6)
  - 1000 concurrent users
  - 10,000 req/min sustained

**Load Test Scenarios:**
```bash
# k6 scripts
tests/load/
├── scenario_1_webhook_flood.js   # WhatsApp burst
├── scenario_2_api_queries.js     # Client queries
├── scenario_3_worker_load.js     # 10k jobs enqueued
└── scenario_4_mixed.js           # Real-world mix
```

---

## TRACK 2: Integration & Compliance (Critical Path)

**Owner:** Backend Engineer + Legal Consultant
**Timeline:** Week 1-14

### Week 1-3: DJEN Public API Integration

**Context:** Use public DJEN APIs from tribunals (TJSC, TJSP, etc)

**Deliverables:**
- [ ] Research available DJEN APIs
  - TJSC: https://busca.tjsc.jus.br/
  - TJSP: https://dje.tjsp.jus.br/cdje/
  - Verify if official API exists or ethical scraping needed
- [ ] Implement scrapers (if no API)
  - Playwright/Puppeteer headless
  - Respect robots.txt
  - Rate limiting (max 10 req/min)
  - Robust error handling
- [ ] Real DJEN provider (replace mock)
  - Multi-tribunal support
  - Result caching (24h)
  - Exponential retry
- [ ] Integration tests with real data
- [ ] Document limitations per tribunal

**Code Structure:**
```typescript
// apps/shared/adapters/djen/scrapers/
interface DJENScraper {
  search(params: {
    tribunal: string;
    nup: string;
    dateRange: { start: Date; end: Date };
  }): Promise<Publication[]>;
}

class TJSCScraper implements DJENScraper { /* ... */ }
class TJSPScraper implements DJENScraper { /* ... */ }

function getDJENScraper(tribunal: string): DJENScraper {
  // Factory pattern
}
```

---

### Week 4-6: DataJud CNJ Integration

**Context:** Official CNJ API - requires credentialing

**Deliverables:**
- [ ] CNJ credentialing process (2-4 weeks)
  - https://www.cnj.jus.br/sistemas/datajud/
  - Required docs: CNPJ, power of attorney, terms of use
- [ ] HTTP provider implementation
  - OAuth2 CNJ authentication
  - Rate limiting (500 req/day per CNJ limits)
  - Intelligent caching (avoid repeated queries)
- [ ] Fallback to mock if API unavailable
- [ ] Tests with real cases (CNJ sandbox)
- [ ] CNJ quota monitoring

**Plan B (if CNJ delays):**
- Use third-party APIs (Jusbrasil API, Projuris)
- Cost: ~R$0.50 per query
- Commercial contract required

---

### Week 7-10: LGPD Compliance Framework

**Deliverables:**
- [ ] Personal data mapping
  - Identification: name, CPF, phone, email
  - Sensitive: NUP (case data)
  - Anonymized: aggregated analytics
- [ ] Data lifecycle implementation
  - Collection: explicit consent (WhatsApp opt-in)
  - Storage: encrypted sensitive fields
  - Retention: 7 years (legal process retention period)
  - Deletion: hard delete + anonymization
- [ ] Data subject rights endpoints (LGPD Art. 18)
  - `GET /gdpr/data-export/:clientId` (portability)
  - `DELETE /gdpr/forget-me/:clientId` (right to be forgotten)
  - `GET /gdpr/consent-history/:clientId` (transparency)
- [ ] Consent management
  - WhatsApp template
  - Consent database
  - Audit trail
- [ ] DPO (Data Protection Officer) designation
- [ ] Incident response plan (data breach)
  - ANPD notification within 72h
  - Communication to data subjects
- [ ] Privacy Policy + Terms of Service

**Database Schema:**
```sql
CREATE TABLE consents (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL,
  consent_type VARCHAR(50), -- data_processing, marketing, ai_analysis
  granted BOOLEAN,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  ip_address INET,
  evidence_url TEXT -- Link to WhatsApp message
);

CREATE TABLE data_deletion_requests (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL,
  requested_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  anonymization_strategy VARCHAR(50) -- hard_delete, anonymize
);
```

---

### Week 11-14: Payment & Calendar Integrations

**Deliverables:**
- [ ] Payment gateway integration (Stripe/Mercado Pago)
  - Checkout sessions
  - Webhook handling (`payment.success`, `payment.failed`)
  - Automatic reconciliation
- [ ] Google Calendar OAuth2
  - Service account setup
  - Slot booking API
  - Conflict detection
  - Email confirmations (SendGrid)
- [ ] Invoice generation
  - PDF templates (Handlebars + Puppeteer)
  - NF-e integration (Focus NFe / Bling)
- [ ] Dunning logic (recurring billing)
  - Retry failed payments
  - Email reminders
  - Suspend service after 3 failures

---

## TRACK 3: Product Evolution (Multi-tenancy & Features)

**Owner:** Full-stack Engineer + Product Manager
**Timeline:** Week 1-14

### Week 1-4: Multi-tenancy Foundation

**Deliverables:**
- [ ] Database schema refactor
  - Add `tenant_id` to ALL tables
  - Foreign key to `tenants` table
  - Row-level security (RLS) policies
  - Zero-downtime migration strategy
- [ ] Tenant management
  - `POST /admin/tenants` (create)
  - `GET /admin/tenants/:id` (details)
  - `PATCH /admin/tenants/:id` (update config)
  - `DELETE /admin/tenants/:id` (soft delete)
- [ ] Tenant isolation
  - Middleware inject `tenant_id` in context
  - Validation in all queries (Drizzle)
  - Isolation tests (tenant A can't see tenant B data)
- [ ] Tenant-level configuration
  - Branding: logo, colors, business name
  - Feature toggles: `enable_ai`, `enable_bulk_import`
  - Billing plan: starter, professional, enterprise
  - Rate limits per tenant

**Database Schema:**
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL, -- law-firm-abc
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255), -- Optional custom domain
  logo_url TEXT,
  primary_color VARCHAR(7), -- HEX color
  subscription_plan VARCHAR(50),
  subscription_status VARCHAR(50),
  max_clients INTEGER DEFAULT 10000,
  max_api_calls_per_day INTEGER DEFAULT 10000,
  features JSONB, -- { "enable_ai": true, "bulk_import": false }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example: clients table refactor
ALTER TABLE clients ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE clients ADD CONSTRAINT fk_tenant
  FOREIGN KEY (tenant_id) REFERENCES tenants(id);
CREATE INDEX idx_clients_tenant ON clients(tenant_id);
```

---

### Week 5-8: White-label UI & Admin Dashboard

**Deliverables:**
- [ ] Admin Dashboard (React + Vite + Shadcn/ui)
  - Login (email/password + 2FA)
  - Tenant switcher (super admin only)
  - Metrics overview
    - Total clients
    - Monitored cases
    - Notifications sent (24h/7d/30d)
    - External API success rate
  - Client management (CRUD)
  - Case management (CRUD)
  - Notification history
  - Settings (branding, features, billing)
- [ ] White-label customization
  - Logo upload (S3/Railway Volumes)
  - Color scheme (CSS variables)
  - Custom domain setup (Railway)
  - Email template customization
- [ ] User management (RBAC)
  - Invite users (email)
  - Role assignment
  - Audit log viewer

**Tech Stack:**
```
Frontend: React 18 + TypeScript + Vite
UI: Shadcn/ui (Tailwind CSS)
State: Zustand or Jotai
API Client: tRPC or React Query
Auth: Clerk.com or Auth.js (NextAuth)
Hosting: Railway (static) or Vercel
```

---

### Week 9-11: Advanced Features (Bulk Operations)

**Deliverables:**
- [ ] Bulk client import
  - CSV upload (client_name, phone, nup, cpf)
  - Validation (Zod)
  - Background processing (BullMQ)
  - Progress tracking
  - Error reporting (partial failures)
- [ ] Bulk process monitoring
  - Associate multiple NUPs to client
  - Monitor all simultaneously
  - Aggregate notifications
- [ ] Template library (WhatsApp messages)
  - Admin create custom templates
  - Variables: `{client_name}`, `{nup}`, `{last_movement}`
  - Preview before sending
- [ ] Scheduled reports
  - Weekly summary (email)
  - Monthly analytics (PDF)
  - Custom filters (by lawyer, by case type)

---

### Week 12-14: AI Enhancements & Analytics

**Deliverables:**
- [ ] AI-powered legal translator v2
  - Expand dictionary: 27 → 200 terms
  - Use OpenAI GPT-4 as fallback (for unmapped terms)
  - Human validation (admin can correct)
  - Feedback loop (learns from corrections)
- [ ] Sentiment analysis (favorable/unfavorable movements)
  - Classify: positive, neutral, negative
  - Urgency score (1-10)
  - Auto-prioritize notifications
- [ ] Predictive analytics (optional)
  - Average time to verdict
  - Success probability (based on history)
  - Proactive alerts
- [ ] Business intelligence dashboard
  - Charts: cases by status, by type, by lawyer
  - Conversion funnel: lead → client → paid
  - Financial metrics: MRR, churn, LTV

---

## Integration Milestones

### Milestone 1: Infrastructure + DJEN Ready (Month 1 - Week 4)

**Integration Point:** Railway functional with real DJEN

**Checklist:**
- [ ] Railway services deployed (api, worker, scheduler)
- [ ] CI/CD pipeline working
- [ ] DJEN scraper functional (at least 1 tribunal)
- [ ] Basic observability (logs + metrics)
- [ ] Security headers + rate limiting

**Demo:** Client can query real DJEN via WhatsApp

---

### Milestone 2: LGPD Compliant Multi-tenant System (Month 2 - Week 8)

**Integration Point:** Ready for soft-launch with 1 tenant

**Checklist:**
- [ ] Multi-tenancy schema deployed
- [ ] LGPD compliance framework complete
- [ ] Admin dashboard MVP (login + metrics)
- [ ] DataJud integration (real or fallback)
- [ ] Audit logging functional
- [ ] Encryption at rest

**Demo:** Law firm can onboard 100 real clients

---

### Milestone 3: Production-Ready for Single Large Firm (Month 3 - Week 12)

**Integration Point:** Soft launch with paying client

**Checklist:**
- [ ] White-label UI deployed
- [ ] Payment integration working
- [ ] Google Calendar working
- [ ] Auto-scaling validated (load tests)
- [ ] Disaster recovery tested
- [ ] All APIs integrated (DJEN + DataJud)
- [ ] Bulk import functional
- [ ] Email notifications + templates

**Demo:** 1,000 clients actively monitored

---

### Milestone 4: Full Feature Set + ISO 27001 Prep (Month 4-6 - Week 24)

**Integration Point:** Ready for enterprise sales

**Checklist:**
- [ ] AI enhancements deployed
- [ ] Complete analytics dashboard
- [ ] Security audit passed
- [ ] ISO 27001 gap analysis complete
- [ ] Penetration testing (external firm)
- [ ] Compliance documentation (policies, procedures)
- [ ] SLA definition: 99.9% uptime
- [ ] Support tiers (email, chat, phone)

**Demo:** System supports 10,000 clients without degradation

---

## Team Structure

### Minimum Team (3-6 months)

```
├── 1x Tech Lead / Architect (you)
├── 2x Backend Engineers (Node.js, PostgreSQL)
├── 1x Full-stack Engineer (React + Node.js)
├── 1x DevOps/Platform Engineer (Railway, CI/CD, monitoring)
├── 1x Legal/Compliance Consultant (part-time, 20h/month)
└── 1x QA Engineer (part-time, starting month 2)

Total: 5.5 FTEs
```

### Expanded Team (if budget allows)

```
+ 1x Product Manager (roadmap, stakeholder mgmt)
+ 1x UX/UI Designer (dashboard, white-label)
+ 1x Data Engineer (analytics, BI)
```

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| CNJ credentialing delays (> 4 weeks) | High | High | Use third-party API (Jusbrasil) as fallback |
| DJEN has no public API | Medium | High | Implement ethical scrapers, validate with lawyers |
| Railway scaling limits reached | Low | Medium | K8s migration path documented, trigger: > 8GB RAM |
| LGPD compliance gaps | Medium | Critical | Hire legal consultant from week 1 |
| Team velocity below expected | High | High | Reduce scope: prioritize Track 2 > Track 3 > Track 1 |
| WhatsApp Cloud API rate limits | Medium | Medium | Implement queue with backpressure, proactive alerts |

---

## Budget Estimate (3-6 months)

### Infrastructure (Railway)
- **Month 1-3:** ~$200/month (staging + prod)
- **Month 4-6:** ~$500/month (scaled up)
- **Total:** ~$2,100

### External Services
- Grafana Cloud: Free tier
- SendGrid: $15/month
- Stripe/Mercado Pago: Transaction fees only
- **Total:** ~$100

### Team (assuming Brazil market rates)
- 2x Backend Engineers: R$15k/month each
- 1x Full-stack: R$18k/month
- 1x DevOps: R$20k/month
- 1x Legal Consultant: R$8k/month (part-time)
- 1x QA (part-time): R$6k/month
- **Total Team:** R$82k/month = ~$480k over 6 months

### Total Budget: ~$485k (6 months)

---

## Success Metrics

### Technical KPIs
- [ ] 99.9% uptime (8.76h downtime/year max)
- [ ] API p95 latency < 200ms
- [ ] External API success rate > 95%
- [ ] Queue processing time p95 < 5 minutes
- [ ] Zero data breaches

### Business KPIs
- [ ] 1,000+ clients onboarded
- [ ] 5,000+ processes monitored
- [ ] 10,000+ notifications sent
- [ ] < 5% customer churn
- [ ] NPS > 50

### Compliance KPIs
- [ ] LGPD framework 100% implemented
- [ ] ISO 27001 gap analysis complete
- [ ] Zero ANPD violations
- [ ] All audit logs retained 7 years
- [ ] 100% consent coverage

---

## Next Steps

1. **Phase 4:** Write formal design document ✅ (this document)
2. **Phase 5:** System decomposition (use `system-decomposition` skill)
3. **Phase 6:** Technology evaluation (use `technology-decision-framework` skill)
4. **Phase 7:** GitHub issue planning (use `github-issue-planning` skill)
5. **Phase 8:** Kickoff sprint 0 (team onboarding, tooling setup)

---

## Appendix A: Migration Path to Kubernetes

**When to migrate:**
- Railway hits 8GB RAM limit per service
- Need multi-region deployment
- Require advanced networking (service mesh)
- Cost optimization at scale (> 10,000 clients)

**Migration strategy:**
1. Dockerize all services (already done)
2. Create Helm charts
3. Setup K8s cluster (EKS, GKE, or AKS)
4. Deploy to K8s staging
5. Blue-green deploy to production
6. Keep Railway as backup for 1 month

**Estimated effort:** 2-3 weeks with 1 DevOps engineer

---

## Appendix B: Tech Stack Summary

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Platform** | Railway | Fast deploy, managed DB, cost-effective |
| **Runtime** | Node.js 20 | Async I/O, large ecosystem |
| **Framework** | Fastify | Performance, plugin system |
| **Database** | PostgreSQL 16 | ACID, RLS, JSONB, mature |
| **Cache/Queue** | Redis 7 | BullMQ support, high performance |
| **ORM** | Drizzle | Type-safe, performant, migrations |
| **Jobs** | BullMQ | Robust, retries, priorities |
| **Auth** | JWT (RS256) | Stateless, industry standard |
| **Monitoring** | Grafana Cloud | Free tier, Prometheus compatible |
| **Frontend** | React + Vite | Fast builds, large ecosystem |
| **UI Library** | Shadcn/ui | Accessible, customizable |

---

**Document Version:** 1.0
**Last Updated:** 2025-01-06
**Approved By:** CTO
**Next Review:** 2025-02-06 (after Milestone 1)
