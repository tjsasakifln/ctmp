# Issues - Sistema Legal Bot

Este diretório contém issues atômicas para implementação do ROADMAP de produção.

## 📋 Índice de Issues

### 🔴 Fase 1 - Semana 1: Infraestrutura Base (Crítico)

| # | Título | Esforço | Prioridade | Status | Dependências |
|---|--------|---------|------------|--------|--------------|
| #1 | [Fix ESLint v9 Configuration](./001-fix-eslint-v9-config.md) | 2-3h | Critical | 🔴 Ready | Nenhuma |
| #2 | [Validate CI Workflow Locally](./002-validate-ci-workflow.md) | 2-3h | High | 🟡 Blocked | Issue #1 |
| #3 | [Configure GitHub Environments](./003-configure-github-environments.md) | 1-2h | High | 🟡 Blocked | Issue #4 |
| #4 | [Setup Railway Staging](./004-setup-railway-staging.md) | 3-4h | High | 🔴 Ready | Nenhuma |

**Total Estimado:** 8-12 horas

**Milestone:** Fase 1 - Preparação para Produção MVP (Semana 1)

**Critério de Conclusão:** CI funcional, staging deployado, workflows validados

---

### 🟡 Fase 1 - Semana 2: Observabilidade

| # | Título | Esforço | Prioridade | Status | Dependências |
|---|--------|---------|------------|--------|--------------|
| #5 | [Add Correlation IDs to Logs](./005-add-correlation-ids-logs.md) | 3-4h | Medium | 🔴 Ready | Nenhuma |
| #6 | [Implement Metrics Endpoint](./006-implement-metrics-endpoint.md) | 4-6h | High | 🟡 Blocked | Issue #5 |

**Total Estimado:** 7-10 horas

**Milestone:** Fase 1 - Preparação para Produção MVP (Semana 2)

**Critério de Conclusão:** Logs rastreáveis, métricas Prometheus exportadas

---

## 🎯 Próximas Issues (A Criar)

### Fase 1 - Semana 2 (continuação)
- [ ] **Issue #7:** Configure Grafana Cloud + Dashboards (4-6h)
- [ ] **Issue #8:** Setup Alerting Rules (2-3h)
- [ ] **Issue #9:** Create Runbook Templates (2-3h)

### Fase 1 - Semana 3: Segurança
- [ ] **Issue #10:** Implement JWT Authentication (6-8h)
- [ ] **Issue #11:** Add RBAC Authorization (4-6h)
- [ ] **Issue #12:** Enable Encryption at Rest (3-4h)
- [ ] **Issue #13:** Implement Audit Logging (4-5h)
- [ ] **Issue #14:** Security Headers Review (2-3h)

### Fase 1 - Semana 4: Testes & Validação
- [ ] **Issue #15:** Create E2E Test Suite (6-8h)
- [ ] **Issue #16:** Setup Load Testing with k6 (4-5h)
- [ ] **Issue #17:** Deploy Production Environment (3-4h)
- [ ] **Issue #18:** Production Smoke Tests (2-3h)

### Fase 2: Integrações Reais (Semanas 5-11)
- [ ] **Issue #19:** Research DJEN APIs (3-4h)
- [ ] **Issue #20:** Implement TJSC Scraper (6-8h)
- [ ] **Issue #21:** Implement TJSP Scraper (6-8h)
- [ ] **Issue #22:** CNJ DataJud Credentialing (N/A - aguardar)
- [ ] **Issue #23:** Implement DataJud HTTP Provider (6-8h)
- [ ] **Issue #24:** Integrate Stripe Payment Gateway (6-8h)
- [ ] **Issue #25:** Integrate Google Calendar OAuth2 (6-8h)
- [ ] **Issue #26:** Implement Email Service (SendGrid) (4-5h)

---

## 📊 Princípios das Issues

### ✅ Atomicidade
- Cada issue é **indivisível** e completa por si só
- Estimativa: **2-8 horas** no máximo
- Se > 8h: quebrar em sub-issues

### ✅ Priorização
- **Critical (🔴):** Bloqueador, impede progresso
- **High (🟠):** Importante, impacta timeline
- **Medium (🟡):** Necessário, mas pode aguardar
- **Low (🟢):** Nice-to-have, não urgente

### ✅ Completude
Cada issue contém:
- **Objetivo:** O que será implementado
- **Contexto:** Por que é necessário
- **Critérios de Aceitação:** Checkboxes testáveis
- **Detalhes Técnicos:** Arquivos, código, comandos
- **Dependências:** O que bloqueia/é bloqueado
- **Estimativa:** Tempo realista

### ✅ Executabilidade
Qualquer desenvolvedor pode:
1. Ler a issue
2. Entender o contexto
3. Executar sem perguntas
4. Validar quando completa

### ✅ Rastreabilidade
- **Labels:** Área, tipo, prioridade, esforço, fase
- **Milestones:** Alinhados com ROADMAP
- **Dependências:** Mapeadas explicitamente
- **Progresso:** Tracked via GitHub Projects

---

## 🏷️ Sistema de Labels

### Por Área
- `area: ci-cd` - CI/CD, workflows, deploys
- `area: observability` - Logs, métricas, monitoring
- `area: security` - Auth, encryption, audit
- `area: deployment` - Infraestrutura, Railway
- `area: integrations` - APIs externas (DJEN, DataJud)
- `area: backend` - Código backend
- `area: database` - Schema, migrations
- `area: testing` - Testes automatizados

### Por Tipo
- `type: bug` - Correção de bug
- `type: feature` - Nova funcionalidade
- `type: enhancement` - Melhoria de existente
- `type: infrastructure` - Setup de infra
- `type: configuration` - Configuração
- `type: validation` - Validação/testes
- `type: documentation` - Documentação

### Por Prioridade
- `priority: critical` - Bloqueador, resolver ASAP
- `priority: high` - Importante, próximas 48h
- `priority: medium` - Importante, próxima semana
- `priority: low` - Nice-to-have, backlog

### Por Esforço
- `effort: 2-3h` - Rápido, 1 sessão
- `effort: 3-4h` - Médio, meio dia
- `effort: 4-6h` - Longo, dia completo
- `effort: 6-8h` - Muito longo, considerar quebrar

### Por Fase
- `phase: 1-week-1` - Fase 1, Semana 1
- `phase: 1-week-2` - Fase 1, Semana 2
- `phase: 1-week-3` - Fase 1, Semana 3
- `phase: 1-week-4` - Fase 1, Semana 4
- `phase: 2-integrations` - Fase 2, Integrações
- etc.

---

## 🎯 Como Usar as Issues

### Para Desenvolvedores

1. **Filtrar issues prontas:**
   ```
   label: "Ready" + sort by priority
   ```

2. **Escolher issue:**
   - Verificar dependências resolvidas
   - Verificar esforço compatível com tempo disponível
   - Atribuir para si mesmo

3. **Executar:**
   - Seguir detalhes técnicos da issue
   - Marcar critérios de aceitação conforme completa
   - Testar todos os checkboxes

4. **Entregar:**
   - Criar PR linkando issue (Fixes #N)
   - Aguardar CI passar
   - Request review
   - Merge e fechar issue

### Para Tech Leads

1. **Priorização:**
   - Revisar backlog semanalmente
   - Ajustar prioridades conforme necessidade
   - Garantir dependências claras

2. **Planejamento:**
   - Atribuir issues para sprints
   - Balancear carga entre devs
   - Identificar blockers antecipadamente

3. **Tracking:**
   - Usar GitHub Projects para kanban
   - Monitorar velocity
   - Atualizar ROADMAP com progresso

---

## 📈 Progresso Atual

### Fase 1 - Semana 1
- [x] CI/CD Workflows criados
- [ ] ESLint v9 fix (Issue #1) - **BLOCKER**
- [ ] CI validado (Issue #2)
- [ ] GitHub Environments (Issue #3)
- [ ] Railway Staging (Issue #4)

**Status:** 🟡 Workflow criado, mas não validado. Issue #1 é bloqueador crítico.

### Fase 1 - Semana 2
- [ ] Correlation IDs (Issue #5)
- [ ] Metrics endpoint (Issue #6)
- [ ] Grafana setup (Issue #7 - TBD)
- [ ] Alerting (Issue #8 - TBD)

**Status:** ⏳ Aguardando conclusão de Semana 1

---

## 🔗 Links Úteis

- [ROADMAP.md](../../ROADMAP.md) - Roadmap completo do projeto
- [GitHub Projects](https://github.com/tjsasakifln/ctmp/projects) - Kanban board
- [GitHub Issues](https://github.com/tjsasakifln/ctmp/issues) - Issues criadas
- [CI Workflows](../../.github/workflows/) - Workflows GitHub Actions

---

## 📞 Suporte

Para dúvidas sobre issues:
1. Ler issue completa (incluindo referências)
2. Checar ROADMAP.md para contexto
3. Perguntar no canal do time
4. Abrir discussion no GitHub (para dúvidas gerais)

---

**Última Atualização:** 2025-01-13
**Issues Criadas:** 6 (1-6)
**Issues Pendentes:** ~20 (estimativa para Fase 1-2 completa)
