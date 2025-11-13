# GitHub Actions Workflows

Este diretório contém os workflows de CI/CD para o projeto Legal Bot.

## 📋 Workflows Disponíveis

### 1. `ci.yml` - Continuous Integration

**Trigger:** Pull requests e pushes para `main` e `develop`

**Jobs:**
- **Lint:** Executa ESLint no código
- **Test:** Roda testes com Vitest (cobertura incluída)
- **Build:** Compila TypeScript para produção
- **Security Audit:** Verifica vulnerabilidades com npm audit

**Serviços:**
- PostgreSQL 16
- Redis 7

**Artefatos:**
- Coverage report (7 dias)
- Build dist (7 dias)

### 2. `deploy-staging.yml` - Deploy Staging

**Trigger:**
- Push para branch `main`
- Manual via workflow_dispatch

**Environment:** staging

**Jobs:**
- **deploy-staging:** Deploy para Railway staging
  - Testes
  - Build
  - Deploy via Railway CLI
  - Migrations
  - Health checks
- **smoke-tests:** Testes de fumaça pós-deploy
  - Health endpoint
  - Readiness endpoint
  - Webhook verification

### 3. `deploy-production.yml` - Deploy Production

**Trigger:**
- Tags `v*.*.*` (ex: v1.0.0)
- Manual via workflow_dispatch

**Environment:** production (requer aprovação)

**Jobs:**
- **pre-deploy-checks:** Validações antes do deploy
  - Testes completos
  - Build
  - Security audit
- **deploy-production:** Deploy para Railway production
  - Deploy via Railway CLI
  - Migrations
  - Health checks (5 tentativas)
  - Verifica endpoints críticos
  - Cria GitHub Release
- **post-deploy-validation:** Validação pós-deploy
  - Smoke tests completos
  - Monitoramento inicial

## 🔐 Secrets Necessários

Configure os seguintes secrets no GitHub (Settings → Secrets and variables → Actions):

### Railway Secrets

#### Staging
```
RAILWAY_TOKEN_STAGING=<token-do-railway-staging>
RAILWAY_PROJECT_ID_STAGING=<project-id-staging>
STAGING_URL=https://staging.legalbot.example.com
```

#### Production
```
RAILWAY_TOKEN_PRODUCTION=<token-do-railway-production>
RAILWAY_PROJECT_ID_PRODUCTION=<project-id-production>
PRODUCTION_URL=https://legalbot.example.com
```

### Application Secrets

```
WHATSAPP_VERIFY_TOKEN=<seu-verify-token>
```

### Monitoring (Opcional)

```
GRAFANA_DASHBOARD_URL=<url-do-dashboard-grafana>
```

### Como obter Railway Token

1. Acesse https://railway.app
2. Vá em Account Settings → Tokens
3. Clique em "Generate New Token"
4. Copie o token e adicione nos secrets do GitHub

### Como obter Railway Project ID

1. No Railway, abra seu projeto
2. Vá em Settings
3. Copie o "Project ID"

## 🚀 Como Usar

### Deploy Staging (Automático)

Basta fazer merge para `main`:
```bash
git checkout main
git merge develop
git push origin main
```

O workflow será disparado automaticamente.

### Deploy Staging (Manual)

1. Vá em Actions → Deploy to Staging
2. Clique em "Run workflow"
3. Selecione a branch
4. Clique em "Run workflow"

### Deploy Production

#### Via Tag (Recomendado)
```bash
# Crie e push uma tag de versão
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

#### Manual
1. Vá em Actions → Deploy to Production
2. Clique em "Run workflow"
3. Digite a versão (ex: v1.0.0)
4. Clique em "Run workflow"
5. Aguarde aprovação no environment "production"

## 📊 Monitoring

### CI Workflow

Após cada PR, verifique:
- ✅ Todos os testes passaram
- ✅ Build foi bem-sucedido
- ✅ Cobertura de testes adequada
- ✅ Sem vulnerabilidades críticas

### Deploy Workflows

Após deploy, monitore:
- ✅ Health checks passando
- ✅ Logs no Railway sem erros
- ✅ Grafana dashboard sem anomalias
- ✅ Taxa de erro < 1%

## 🔄 Rollback

Se algo der errado em produção:

### Opção 1: Deploy da versão anterior
```bash
gh workflow run deploy-production.yml -f version=v1.0.0
```

### Opção 2: Rollback no Railway
1. Acesse o projeto no Railway
2. Vá em Deployments
3. Clique em "Rollback" na versão anterior

## 🛠️ Troubleshooting

### "Railway CLI failed"
- Verifique se o token está correto
- Verifique se o Project ID está correto
- Verifique permissões do token

### "Health check failed"
- Verifique logs no Railway
- Verifique se as migrations rodaram
- Verifique variáveis de ambiente

### "Tests failed"
- Execute localmente: `npm test`
- Verifique logs do workflow
- Verifique se dependencies estão corretas

## 📝 Próximos Passos

1. **Configurar Environments no GitHub:**
   - Settings → Environments → New environment
   - Criar: `staging` e `production`
   - Em `production`, habilitar "Required reviewers"

2. **Configurar Railway:**
   - Criar projetos staging e production
   - Provisionar PostgreSQL e Redis
   - Configurar variáveis de ambiente

3. **Testar workflows:**
   - Criar uma PR de teste
   - Verificar se CI passa
   - Fazer merge e verificar deploy staging

4. **Documentar variáveis de ambiente:**
   - Criar `.env.example` completo
   - Documentar todas as vars necessárias

## 🔗 Links Úteis

- [Railway Documentation](https://docs.railway.app)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Railway CLI](https://docs.railway.app/develop/cli)

## 📞 Suporte

Para problemas com os workflows, abra uma issue no repositório.
