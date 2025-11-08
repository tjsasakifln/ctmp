# Backlog Audit - Quick Start Guide

Guia rápido para executar e interpretar a auditoria de backlog.

## 🚀 Uso Rápido (5 minutos)

### 1. Executar Auditoria

No Claude Code:
```
/review-backlog
```

Aguarde 2-5 minutos enquanto a análise completa é executada.

### 2. Revisar Resultados

```bash
# Ler relatório principal (15 min)
cat ops/issue-audit/FINAL_REPORT.txt

# Ver top 20 prioridades (5 min)
head -25 ops/issue-audit/BACKLOG_ORDER.md

# Verificar sprint recomendada (5 min)
cat ops/issue-audit/SPRINT_PLAN.md
```

### 3. Aplicar Mudanças

No Claude Code, quando solicitado:
```
APLICAR AGORA
```

Ou manualmente:
```bash
cd ops/issue-audit
./apply_changes.sh
```

### 4. Verificar Aplicação

```bash
# Ver distribuição de prioridades
gh issue list --label "priority: P0" --limit 20

# Ver issues de alto risco
gh issue list --label "risk/high"

# Estatísticas gerais
node ops/issue-audit/stats.js
```

---

## 📊 Interpretando os Artefatos

### FINAL_REPORT.txt ⭐ **Comece aqui**
```
╔════════════════════════════════════╗
║   BACKLOG AUDIT - FINAL REPORT     ║
╚════════════════════════════════════╝

Total Issues: 94
✅ Adequate Quality: 40 (42.6%)
⚠️  P0 Issues: 68 (72.3%) ← ALERTA!
```

**O que olhar**:
- % P0 Issues: Se >50%, backlog está insustentável
- % Adequate Quality: Meta é >90%
- High-Risk Issues: Quantas issues críticas (security, PII, billing)
- Top 10 by Value: Issues de maior ROI

### BACKLOG_ORDER.md - Backlog Priorizado

```markdown
| ID  | Título                    | WSJF | RICE | Priority | Risk | Rationale        |
|-----|---------------------------|------|------|----------|------|------------------|
| #72 | Dependency vulnerability  | 12.0 | 13.3 | P0       | high | Security audit   |
| #74 | Security scanning         | 11.0 | 13.3 | P0       | high | Critical security|
```

**O que olhar**:
- **WSJF + RICE altos**: Máximo ROI (faça primeiro)
- **Risk = high**: Precisa security review
- **Rationale**: Justificativa da posição

**Regras**:
- WSJF > 10: Prioridade máxima
- WSJF > 5: P0 candidato
- WSJF > 3: P1 mínimo
- WSJF < 1: P3 (questionar se vale fazer)

### SPRINT_PLAN.md - Recomendação de Sprint

```markdown
Sprint Goal: Establish security baseline
Capacity: 40h (1 dev, 1 week)
Planned Effort: 31h (78% utilization)

SCOPE (locked):
1. #72 - Dependency audit (3h, P0, high-risk)
2. #74 - Security scanning (3h, P0, high-risk)
...
```

**O que olhar**:
- **Capacity vs Planned**: Se >90%, sprint agressiva (risco de overflow)
- **Kill Criteria**: Quando abortar escopo
- **Expected ROI**: Validar se faz sentido

### ISSUE_FIXUPS.md - Melhorias Necessárias

```markdown
## Issue #64: Setup support tiers

### Problemas Detectados
- [ ] Falta critérios de aceitação
- [ ] Título muito vago
- [ ] Sem estimativa de esforço

### DEPOIS (proposto)
**Título**: Implement multi-tier support system (email, chat, phone)
**Descrição**:
## Context
...
## Acceptance Criteria
- [ ] Email support tier configured
...
```

**O que fazer**:
- Copiar texto "DEPOIS" para as issues
- Ou copiar "Comentário Pronto" e colar na issue
- Atualizar labels conforme sugerido

### UNBLOCKING_PLAN.md - Resolver Bloqueios

```markdown
## #94: Payment reconciliation - Bloqueada por #93

**Ação de Desbloqueio**:
- [ ] Criar mock de webhook para testar isoladamente
- [ ] Feature flag para desenvolver em paralelo
- [ ] Definir contrato de interface
**Timeline**: 1-2 dias
```

**O que fazer**:
- Implementar ações de desbloqueio ANTES de iniciar issue bloqueada
- Priorizar issues que desbloqueiam outras (efeito cascata)

---

## 🎯 Workflows Comuns

### Workflow 1: Planejamento de Sprint (Segunda-feira)

```bash
# 1. Executar auditoria
/review-backlog

# 2. Revisar top 20
head -25 ops/issue-audit/BACKLOG_ORDER.md

# 3. Validar sprint recomendada
cat ops/issue-audit/SPRINT_PLAN.md

# 4. Ajustar escopo se necessário (capacity do time)
# Editar SPRINT_PLAN.md com issues da BACKLOG_ORDER.md

# 5. Aplicar mudanças
# Digite "APLICAR AGORA" no Claude Code

# 6. Criar milestone da sprint
gh issue list --label "priority: P0" --limit 10 | \
  xargs -I {} gh issue edit {} --milestone "Sprint 2025-W45"
```

### Workflow 2: Higiene Semanal do Backlog

```bash
# 1. Re-auditar
/review-backlog

# 2. Comparar com semana anterior
cd ops/issue-audit
diff BACKLOG_ORDER.md BACKLOG_ORDER.md.backup | grep "^[<>]" | head -20

# 3. Verificar progresso nas métricas
node stats.js

# 4. Se % P0 ainda alto (>40%), revisar "ISSUE_FIXUPS.md"
#    e quebrar issues grandes em menores
```

### Workflow 3: Pre-Release Security Review

```bash
# 1. Filtrar apenas issues de segurança
gh issue list --label "risk/high" --state open

# 2. Auditar
/review-backlog

# 3. Verificar se há P0 de segurança
grep "risk/high.*P0" ops/issue-audit/BACKLOG_ORDER.md

# 4. Bloquear release se houver P0 de alto risco aberto
# Criar issue de bloqueio:
gh issue create --title "RELEASE BLOCKER: Security issues pending" \
  --body "$(gh issue list --label 'risk/high' --label 'priority: P0')"
```

### Workflow 4: Desbloqueio de Dependências

```bash
# 1. Listar issues bloqueadas
grep "status: blocked" ops/issue-audit/raw_issues.json | jq -r '.number'

# 2. Ver planos de desbloqueio
cat ops/issue-audit/UNBLOCKING_PLAN.md

# 3. Criar sub-tasks de desbloqueio
# Para cada ação no UNBLOCKING_PLAN.md, criar issue separada:
gh issue create --title "Unblock #94: Create webhook mock" \
  --body "Creates mock webhook to unblock #94..." \
  --label "type: chore" --label "priority: P0"
```

---

## 📈 KPIs e Metas

### Backlog Saudável

| Métrica | 🔴 Crítico | 🟡 Atenção | 🟢 Saudável |
|---------|----------|-----------|------------|
| % P0 Issues | >50% | 30-50% | <30% |
| % Qualidade Adequada | <50% | 50-80% | >80% |
| % Bloqueadas | >20% | 10-20% | <10% |
| Issues Alto Risco | >30 | 15-30 | <15 |
| WSJF Médio (top 10) | <5.0 | 5.0-8.0 | >8.0 |

### Progressão Típica

**Semana 1** (Baseline):
```
Total: 94 issues
P0: 68 (72.3%) 🔴
Qualidade: 42.6% 🔴
Bloqueadas: 13.8% 🟢
Alto Risco: 34 🟡
```

**Semana 4** (Meta):
```
Total: 80 issues (-14)
P0: 28 (35%) 🟡
Qualidade: 75% 🟡
Bloqueadas: 8% 🟢
Alto Risco: 18 🟢
```

**Semana 8** (Saudável):
```
Total: 65 issues (-29)
P0: 18 (27.7%) 🟢
Qualidade: 92% 🟢
Bloqueadas: 4% 🟢
Alto Risco: 10 🟢
```

---

## 🔧 Troubleshooting

### "Muitos P0s" (>50%)

**Causa**: Falta de quebra de escopo ou tudo é "crítico"

**Solução**:
1. Revisar `ISSUE_FIXUPS.md` para issues grandes
2. Quebrar issues P0 monolíticas em P1/P2 menores
3. Re-avaliar: é REALMENTE crítico? (perda de dados? serviço parado?)
4. Usar kill criteria: "Se não fizer em 2 semanas, qual impacto?" Se baixo = P1/P2

### "Qualidade Baixa" (<60%)

**Causa**: Issues sem contexto/critérios/estimativa

**Solução**:
1. Abrir `ISSUE_FIXUPS.md`
2. Para top 20 issues, copiar texto "DEPOIS" e atualizar no GitHub
3. Treinar time: usar template de issue com seções obrigatórias
4. Gate keeping: não aceitar issue sem critérios de aceitação

### "Muitas Bloqueadas" (>15%)

**Causa**: Dependências mal gerenciadas

**Solução**:
1. Ler `UNBLOCKING_PLAN.md`
2. Criar sub-tasks de desbloqueio como P0
3. Usar feature flags para desenvolver em paralelo
4. Definir contratos de interface (stubs/mocks)

### "Alto Risco Crescendo"

**Causa**: Dívida de segurança acumulando

**Solução**:
1. Filtrar: `gh issue list --label "risk/high"`
2. Criar sprint dedicada de segurança
3. Trazer security engineer para review
4. Bloquear features novas até resolver P0 de segurança

---

## 💡 Dicas Avançadas

### Re-priorizar com Contexto de Negócio

Se o resultado automático não refletir prioridades de negócio:

```bash
# Editar manualmente BACKLOG_ORDER.md
# Ajustar scores WSJF/RICE com contexto real:
# - Cliente pagante pediu feature X = +5 Business Value
# - Regulação mudou = +10 Risk Reduction
# - Competidor lançou similar = +8 Time Criticality

# Re-calcular ordenação:
cd ops/issue-audit
node analyze.js --recalculate
```

### Integrar com Planning Poker

Após auditoria, usar estimativas para planning poker:

```bash
# Exportar top 20 para CSV
head -22 ops/issue-audit/backlog_order.csv > sprint_planning.csv

# Importar em ferramenta de planning poker
# Time vota esforço real
# Atualizar BACKLOG_ORDER.md com estimativas reais
```

### Criar Dashboard Automatizado

```bash
# Cron job semanal
0 9 * * 1 cd /path/to/ctmp && /review-backlog && \
  node ops/issue-audit/stats.js > backlog_metrics.txt && \
  mail -s "Weekly Backlog Metrics" team@company.com < backlog_metrics.txt
```

---

## 📚 Leitura Adicional

- `EXECUTIVE_SUMMARY.md` - Análise completa dos findings
- `AUDIT_LOG.json` - Metadata técnica e decisões
- `README.md` - Visão geral dos comandos
- `.claude/commands/review-backlog.md` - Documentação do comando

---

**Dúvidas?** Veja a seção Troubleshooting ou execute `/review-backlog` novamente para re-análise.

**Última atualização**: 2025-11-08
