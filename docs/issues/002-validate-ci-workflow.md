# Issue #2: Validate CI Workflow Locally

## 🎯 Objetivo
Validar que o CI workflow (lint, test, build) funciona corretamente antes de testar em PR real.

## 📋 Contexto
**Situação Atual:**
- CI workflow criado (`.github/workflows/ci.yml`)
- Não validado localmente
- ESLint v9 config precisa ser corrigido primeiro (Issue #1)
- Risco de falhas inesperadas no primeiro PR

**Impacto:**
- Garantir que CI não vai falhar por problemas de configuração
- Reduzir ciclos de feedback (evitar push-fail-fix-push)
- Validar que PostgreSQL e Redis services funcionam no CI

## ✅ Critérios de Aceitação

1. [ ] `npm install` executa sem erros
2. [ ] `npm run lint` passa sem erros
3. [ ] `npm test` passa com todos os testes
4. [ ] `npm run build` gera dist/ sem erros
5. [ ] `npm audit --audit-level=high` não retorna vulnerabilidades críticas
6. [ ] Cobertura de testes >= 80% (linhas, funções, branches)
7. [ ] Documentação de validação criada

## 🔧 Detalhes Técnicos

**Pré-requisitos:**
- Issue #1 (ESLint v9) deve estar resolvida
- Docker Desktop rodando (para PostgreSQL + Redis)

**Comandos para Executar:**
```bash
cd apps/backend

# 1. Instalar dependências
npm ci

# 2. Subir serviços
docker-compose up -d postgres redis

# 3. Aguardar serviços
sleep 10

# 4. Validar lint
npm run lint
echo "✅ Lint passou"

# 5. Gerar e rodar migrations
npm run db:generate
npm run db:migrate

# 6. Rodar testes
npm test
echo "✅ Testes passaram"

# 7. Rodar testes com cobertura
npm run test:coverage
echo "✅ Coverage OK"

# 8. Build
npm run build
echo "✅ Build passou"

# 9. Security audit
npm audit --audit-level=high
echo "✅ Security audit OK"

# 10. Verificar artefatos
ls -la dist/
ls -la dist/index.js
echo "✅ Artefatos gerados"

# 11. Cleanup
docker-compose down
```

**Criar Script de Validação:**
```bash
# File: scripts/validate-ci.sh
#!/bin/bash
set -e

echo "🔍 Validando CI workflow localmente..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

cd apps/backend

echo "📦 Instalando dependências..."
npm ci

echo "🐳 Iniciando serviços Docker..."
docker-compose up -d postgres redis
sleep 10

echo "🔍 Lint..."
npm run lint && echo -e "${GREEN}✅ Lint passou${NC}" || exit 1

echo "🗄️ Migrações..."
npm run db:generate
npm run db:migrate && echo -e "${GREEN}✅ Migrations OK${NC}" || exit 1

echo "🧪 Testes..."
npm test && echo -e "${GREEN}✅ Testes passaram${NC}" || exit 1

echo "📊 Coverage..."
npm run test:coverage && echo -e "${GREEN}✅ Coverage >= 80%${NC}" || exit 1

echo "🏗️ Build..."
npm run build && echo -e "${GREEN}✅ Build passou${NC}" || exit 1

echo "🔒 Security audit..."
npm audit --audit-level=high && echo -e "${GREEN}✅ No high vulnerabilities${NC}" || exit 1

echo "🧹 Cleanup..."
docker-compose down

echo -e "${GREEN}✅ Validação completa! CI deve passar.${NC}"
```

**Verificações de Cobertura:**
```bash
# Coverage deve estar em apps/backend/coverage/
# Verificar HTML report: coverage/index.html
# Verificar thresholds em vitest.config.ts:
#   lines: 80%
#   functions: 80%
#   branches: 80%
#   statements: 80%
```

## 📦 Dependências
- **Depende de:** Issue #1 (ESLint v9 fix) - BLOCKER
- **Bloqueia:** Criação de PRs de teste

## 🏷️ Labels
- `priority: high`
- `type: validation`
- `area: ci-cd`
- `effort: 2-3h`
- `phase: 1-week-1`

## 📚 Referências
- `.github/workflows/ci.yml`
- `apps/backend/vitest.config.ts`
- `apps/backend/package.json`
- ROADMAP.md - Fase 1, Semana 1

## ✍️ Notas para Implementação
1. Executar script passo a passo primeiro
2. Documentar qualquer falha encontrada
3. Criar issues para problemas novos descobertos
4. Testar em ambiente limpo (sem node_modules cache)

## 🎯 Deliverables
- [ ] Script `scripts/validate-ci.sh` criado
- [ ] README atualizado com instruções de validação
- [ ] Relatório de validação (output do script)
- [ ] Issues criadas para problemas encontrados (se houver)

## 🎯 Milestone
**Fase 1: Preparação para Produção MVP** - Semana 1

## ⏱️ Estimativa
**2-3 horas** (setup + execução + documentação)
