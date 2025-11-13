# Issue #3: Configure GitHub Environments and Secrets

## 🎯 Objetivo
Configurar GitHub Environments (staging, production) e todos os secrets necessários para os workflows de deploy funcionarem.

## 📋 Contexto
**Situação Atual:**
- Workflows de deploy criados (staging, production)
- Secrets não configurados
- Environments não existem
- Deploys vão falhar sem configuração

**Impacto:**
- Habilitar deploys automatizados para staging
- Habilitar deploys manuais para production
- Permitir aprovações antes de deploy production
- Segurança de secrets via GitHub

## ✅ Critérios de Aceitação

1. [ ] Environment `staging` criado no GitHub
2. [ ] Environment `production` criado com aprovação obrigatória
3. [ ] Todos os secrets necessários configurados
4. [ ] Secrets testados (formato correto)
5. [ ] Documentação de secrets atualizada
6. [ ] Proteção de branches configurada (opcional)

## 🔧 Detalhes Técnicos

### Passo 1: Criar Environments

**GitHub Repository → Settings → Environments**

#### Environment: `staging`
- Nome: `staging`
- URL: `https://staging-api.railway.app` (placeholder, atualizar depois)
- Deployment branches: `main` only
- Required reviewers: Nenhum (deploy automático)
- Wait timer: 0 minutes

#### Environment: `production`
- Nome: `production`
- URL: `https://api.railway.app` (placeholder, atualizar depois)
- Deployment branches: Tags only
- **Required reviewers:** 1+ (você ou tech lead)
- Wait timer: 0 minutes
- Prevent self-review: Habilitado

### Passo 2: Configurar Secrets

**GitHub Repository → Settings → Secrets and variables → Actions**

#### Secrets Necessários:

**Railway - Staging:**
```
RAILWAY_TOKEN_STAGING
  Descrição: Railway API token para staging
  Como obter: Railway.app → Account Settings → Tokens
  Formato: exemplo "railway_..."

RAILWAY_PROJECT_ID_STAGING
  Descrição: ID do projeto Railway staging
  Como obter: Railway project → Settings → Project ID
  Formato: UUID (ex: "a1b2c3d4-...")

STAGING_URL
  Descrição: URL completa do ambiente staging
  Formato: https://staging-api.railway.app
  Nota: Atualizar após deploy inicial
```

**Railway - Production:**
```
RAILWAY_TOKEN_PRODUCTION
  Descrição: Railway API token para production
  Como obter: Railway.app → Account Settings → Tokens (criar separado)
  Formato: "railway_..."

RAILWAY_PROJECT_ID_PRODUCTION
  Descrição: ID do projeto Railway production
  Como obter: Railway project → Settings → Project ID
  Formato: UUID

PRODUCTION_URL
  Descrição: URL completa do ambiente production
  Formato: https://api.railway.app ou https://api.legalbot.com.br
  Nota: Atualizar após configurar domínio
```

**Application Secrets:**
```
WHATSAPP_VERIFY_TOKEN
  Descrição: Token de verificação WhatsApp Cloud API
  Formato: String aleatória segura
  Nota: Mesmo valor usado em .env do backend
  Como gerar: openssl rand -base64 32
```

**Monitoring (Opcional):**
```
GRAFANA_DASHBOARD_URL
  Descrição: URL do dashboard Grafana Cloud
  Formato: https://grafana.com/orgs/your-org/dashboards/...
  Nota: Configurar após Fase 1 Semana 2
```

### Passo 3: Validar Secrets

**Criar script de validação:**
```bash
# File: scripts/validate-secrets.sh
#!/bin/bash

echo "🔒 Validando formato dos secrets..."

# Função para validar formato
validate_secret() {
  local name=$1
  local value=$2
  local pattern=$3

  if [[ -z "$value" ]]; then
    echo "❌ $name não configurado"
    return 1
  fi

  if [[ ! "$value" =~ $pattern ]]; then
    echo "❌ $name formato inválido"
    return 1
  fi

  echo "✅ $name OK"
  return 0
}

# Validar formato (sem expor valores)
validate_secret "RAILWAY_TOKEN" "$RAILWAY_TOKEN" "^railway_.*"
validate_secret "RAILWAY_PROJECT_ID" "$RAILWAY_PROJECT_ID" "^[0-9a-f-]{36}$"
validate_secret "URL" "$URL" "^https://.*"

echo "✅ Validação de secrets completa"
```

### Passo 4: Testar Configuração

**Trigger manual do workflow:**
```bash
# Via GitHub UI:
# Actions → Deploy to Staging → Run workflow → Run

# Via GitHub CLI:
gh workflow run deploy-staging.yml --ref main
```

**Verificar logs:**
- Secrets devem estar mascarados (***) nos logs
- Railway CLI deve autenticar com sucesso
- Erros de auth indicam secret incorreto

## 📦 Dependências
- **Depende de:** Issue #4 (Setup Railway staging) para obter tokens/IDs
- **Bloqueia:** Primeiro deploy para staging
- **Bloqueia:** Primeiro deploy para production

## 🏷️ Labels
- `priority: high`
- `type: configuration`
- `area: ci-cd`
- `effort: 1-2h`
- `phase: 1-week-1`

## 📚 Referências
- [GitHub Environments Docs](https://docs.github.com/en/actions/deployment/targeting-different-environments)
- [GitHub Secrets Docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-production.yml`
- `.github/workflows/README.md`

## ✍️ Notas para Implementação

**Segurança:**
1. Nunca commitar secrets no código
2. Usar tokens separados para staging e production
3. Rotacionar tokens periodicamente (a cada 90 dias)
4. Limitar escopo de tokens ao mínimo necessário

**Troubleshooting:**
- Se workflow falhar com "secret not found": verificar nome exato do secret
- Se Railway auth falhar: verificar token não expirou
- Se URL não resolve: verificar DNS configurado

**Checklist de Validação:**
```
[ ] Environments criados (staging, production)
[ ] Production requer aprovação
[ ] 6+ secrets configurados
[ ] Secrets não vazam em logs
[ ] Workflow run manual funciona (pode falhar no deploy, mas auth deve passar)
```

## 🎯 Deliverables
- [ ] Environments configurados (screenshot)
- [ ] Secrets configurados (lista de nomes, SEM valores)
- [ ] Documentação atualizada (como rotacionar secrets)
- [ ] Workflow testado (log de execução)

## 🎯 Milestone
**Fase 1: Preparação para Produção MVP** - Semana 1

## ⏱️ Estimativa
**1-2 horas** (setup + documentação + validação)

**Nota:** Requer Issue #4 completa para obter Railway tokens/IDs reais.
