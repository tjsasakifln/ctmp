# Como Criar Issues Reais no GitHub

## ⚠️ Situação Atual

Os arquivos em `docs/issues/*.md` são **templates/documentação**, não issues reais do GitHub.

Para ter issues rastreáveis em https://github.com/tjsasakifln/ctmp/issues, você precisa criá-las manualmente.

---

## 🚀 Opção 1: Script Automatizado (Recomendado)

Execute o script que cria todas as 6 issues de uma vez:

```bash
./scripts/create-github-issues.sh
```

Este script irá:
- ✅ Criar Issue #1 e fechar imediatamente (já resolvida)
- 📋 Criar Issues #2-6 abertas
- 🏷️ Adicionar labels apropriadas
- 👤 Atribuir para você automaticamente

**Pré-requisito:** `gh` CLI autenticado
```bash
gh auth login
```

---

## 📝 Opção 2: Criar Manualmente (Uma por Uma)

Se preferir criar manualmente ou script falhar:

### Issue #1: Fix ESLint Errors ✅ (RESOLVED)

```bash
gh issue create \
  --title "Fix ESLint Errors" \
  --body-file docs/issues/001-fix-eslint-v9-config.md \
  --label "priority: critical,type: bug,area: code-quality" \
  --assignee "@me"

# Fechar imediatamente
gh issue close 1 --comment "✅ Resolved in commit cb2edaf"
```

### Issue #2: Validate CI Workflow Locally

```bash
gh issue create \
  --title "Validate CI Workflow Locally" \
  --body-file docs/issues/002-validate-ci-workflow.md \
  --label "priority: high,type: validation,area: ci-cd,effort: 2-3h" \
  --assignee "@me"
```

### Issue #3: Configure GitHub Environments

```bash
gh issue create \
  --title "Configure GitHub Environments and Secrets" \
  --body-file docs/issues/003-configure-github-environments.md \
  --label "priority: high,type: configuration,area: ci-cd,effort: 1-2h" \
  --assignee "@me"
```

### Issue #4: Setup Railway Staging

```bash
gh issue create \
  --title "Setup Railway Staging Environment" \
  --body-file docs/issues/004-setup-railway-staging.md \
  --label "priority: high,type: infrastructure,area: deployment,effort: 3-4h" \
  --assignee "@me"
```

### Issue #5: Add Correlation IDs to Logs

```bash
gh issue create \
  --title "Add Correlation IDs to Structured Logs" \
  --body-file docs/issues/005-add-correlation-ids-logs.md \
  --label "priority: medium,type: enhancement,area: observability,effort: 3-4h" \
  --assignee "@me"
```

### Issue #6: Implement Metrics Endpoint

```bash
gh issue create \
  --title "Implement Prometheus Metrics Endpoint" \
  --body-file docs/issues/006-implement-metrics-endpoint.md \
  --label "priority: high,type: feature,area: observability,effort: 4-6h" \
  --assignee "@me"
```

---

## 🌐 Opção 3: Via GitHub Web UI

Se não tiver `gh` CLI instalado:

1. Acesse https://github.com/tjsasakifln/ctmp/issues/new
2. Copie conteúdo de cada `docs/issues/*.md`
3. Cole no corpo da issue
4. Adicione título e labels manualmente
5. Crie a issue

**Desvantagem:** Mais trabalhoso (6 issues × ~2 min = 12 minutos)

---

## 🏷️ Labels Necessárias

Antes de criar issues, configure labels no repositório:

### Por Prioridade
- `priority: critical` (vermelho) - Bloqueador
- `priority: high` (laranja) - Importante
- `priority: medium` (amarelo) - Necessário
- `priority: low` (verde) - Nice-to-have

### Por Tipo
- `type: bug` (vermelho) - Correção de bug
- `type: feature` (azul) - Nova funcionalidade
- `type: enhancement` (azul claro) - Melhoria
- `type: infrastructure` (roxo) - Setup de infra
- `type: configuration` (cinza) - Configuração
- `type: validation` (verde claro) - Validação/testes

### Por Área
- `area: ci-cd` - CI/CD, workflows
- `area: observability` - Logs, métricas
- `area: security` - Auth, encryption
- `area: deployment` - Infraestrutura
- `area: code-quality` - Linting, typing

### Por Esforço
- `effort: 2-3h` - Rápido
- `effort: 3-4h` - Médio
- `effort: 4-6h` - Longo
- `effort: 6-8h` - Muito longo

### Por Fase
- `phase: 1-week-1` - Fase 1, Semana 1
- `phase: 1-week-2` - Fase 1, Semana 2
- etc.

**Criar labels via CLI:**
```bash
# Prioridade
gh label create "priority: critical" --color "d73a4a" --description "Bloqueador, resolver ASAP"
gh label create "priority: high" --color "ff9800" --description "Importante, próximas 48h"
gh label create "priority: medium" --color "ffc107" --description "Importante, próxima semana"
gh label create "priority: low" --color "4caf50" --description "Nice-to-have, backlog"

# Tipo
gh label create "type: bug" --color "d73a4a" --description "Correção de bug"
gh label create "type: feature" --color "2196f3" --description "Nova funcionalidade"
gh label create "type: enhancement" --color "81d4fa" --description "Melhoria de existente"
gh label create "type: infrastructure" --color "9c27b0" --description "Setup de infra"
gh label create "type: configuration" --color "9e9e9e" --description "Configuração"
gh label create "type: validation" --color "8bc34a" --description "Validação/testes"

# Área
gh label create "area: ci-cd" --color "1976d2" --description "CI/CD, workflows"
gh label create "area: observability" --color "ff5722" --description "Logs, métricas"
gh label create "area: security" --color "e91e63" --description "Auth, encryption"
gh label create "area: deployment" --color "673ab7" --description "Infraestrutura"
gh label create "area: code-quality" --color "607d8b" --description "Linting, typing"

# Esforço
gh label create "effort: 2-3h" --color "c5f015" --description "Rápido, 1 sessão"
gh label create "effort: 3-4h" --color "fff100" --description "Médio, meio dia"
gh label create "effort: 4-6h" --color "ffae00" --description "Longo, dia completo"
gh label create "effort: 6-8h" --color "ff5e00" --description "Muito longo, considerar quebrar"

# Fase
gh label create "phase: 1-week-1" --color "0e8a16" --description "Fase 1, Semana 1"
gh label create "phase: 1-week-2" --color "1d76db" --description "Fase 1, Semana 2"
```

---

## ✅ Verificação

Após criar issues, verifique:

```bash
# Listar issues abertas
gh issue list

# Ver issue específica
gh issue view 2

# Atribuir para você
gh issue edit 2 --add-assignee "@me"

# Adicionar milestone
gh issue edit 2 --milestone "Phase 1 - Week 1"
```

---

## 📊 Estado Esperado Após Criação

```
Issues Abertas:
  #2 - Validate CI Workflow Locally (high priority)
  #3 - Configure GitHub Environments (high priority)
  #4 - Setup Railway Staging (high priority)
  #5 - Add Correlation IDs to Logs (medium priority)
  #6 - Implement Metrics Endpoint (high priority)

Issues Fechadas:
  #1 - Fix ESLint Errors ✅ (resolved in cb2edaf)
```

---

## 🔄 Workflow Após Criação

1. **Pegar issue:** `gh issue develop 2 --checkout`
2. **Trabalhar na issue:** Seguir instruções em `docs/issues/002-*.md`
3. **Criar PR:** `gh pr create --title "Fix: ..." --body "Closes #2"`
4. **Merge & close:** Issue fecha automaticamente quando PR é mergeado

---

## 📞 Problemas?

Se script falhar ou issues não criarem:
1. Verificar `gh auth status`
2. Verificar permissões do token (issues:write)
3. Criar manualmente via web UI
4. Abrir discussion no repositório
