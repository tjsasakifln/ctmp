# Review Backlog

Execute auditoria completa do backlog com análise WSJF+RICE+Risk, geração de artefatos e recomendações de sprint.

---

## Processo de Auditoria

### 1. COLETA DE DADOS

Obtenha todas as issues (abertas e fechadas) do repositório:

```bash
mkdir -p ops/issue-audit
gh issue list --limit 1000 --state all --json number,title,body,state,labels,assignees,milestone,createdAt,updatedAt,url > ops/issue-audit/raw_issues.json
gh pr list --limit 100 --state all --json number,title,body,state,labels,createdAt,updatedAt,url,headRefName > ops/issue-audit/raw_prs.json
```

### 2. ANÁLISE COMPLETA

Crie um agente especializado (Task tool, subagent_type: general-purpose) para executar:

#### A. VALIDAÇÃO DE QUALIDADE
Para cada issue, valide:
- **Título**: verbo de ação + escopo único (< 80 chars)
- **Descrição**: Contexto, Objetivo, Critérios de Aceitação (Dado/Quando/Então), Impacto, Riscos, Testes, DoD
- **Evidências**: links, logs, stack traces, specs
- **Esforço**: estimado em horas ou pontos
- **Labels obrigatórias**: type/*, area/*, priority/*, status/*, size/*
- **Labels condicionais**: risk/* (se toca segurança/PII/billing), security/*
- **Atomicidade**: uma issue = um deliverable claro

#### B. DETECÇÃO DE DUPLICATAS
- Calcular similaridade de cosseno (TF-IDF) entre títulos+descrições
- Threshold: similarity ≥ 0.85 = duplicata
- Identificar issue canônica (mais antiga com melhor contexto)
- Gerar texto pronto de comentário para merge

#### C. MAPEAMENTO DE DEPENDÊNCIAS
- Extrair referências: #123, "blocked by", "blocks", "depends on"
- Construir grafo direcionado (PERT-like)
- Detectar ciclos (se houver, propor ruptura)
- Para cada issue bloqueada, criar plano de desbloqueio

#### D. CLASSIFICAÇÃO DE RISCO
- Calcular: Severidade (S1-S4) × Probabilidade (P1-P4)
- Identificar: auth, PII, billing, perda de dados, disponibilidade
- Risk score: Alto ≥9, Médio 5-8, Baixo <5
- Aplicar label risk/* apropriada

#### E. PRIORIZAÇÃO OBJETIVA

**Fórmulas:**
```
WSJF = (User Value [0-10] + Business Value [0-10] + Risk Reduction [0-10] + Time Criticality [0-10]) / Effort [hours]

RICE = (Reach [0-10] × Impact [0-10] × Confidence [0-1]) / Effort [hours]

Final Score = (WSJF + RICE) / 2
```

**Regras de Prioridade:**
- **P0**: WSJF > 5 OU crítico (interrupção serviço, perda dados, segurança crítica, bloqueador release)
- **P1**: WSJF > 3 OU alto impacto em meta trimestral, funcionalidade core
- **P2**: WSJF 1-3, melhorias relevantes, otimizações
- **P3**: WSJF < 1, nice-to-have, baixo ROI

**Desempate**: Segurança > Receita > Experiência Dev

#### F. CORREÇÕES E PADRONIZAÇÃO
Para cada issue que falhar no checklist, gerar:
1. Novo título sugerido
2. Descrição reescrita com todas seções
3. Labels target
4. Estimativa revisada
5. Comentário pronto (Markdown) para colar na issue
6. Se necessário: split em sub-issues OU merge para canônica

#### G. PLANO DE SPRINT
Criar sprint de 1-2 semanas:
- Meta clara e mensurável
- Escopo travado (P0/P1 + desbloqueios de dependência)
- Capacity: 40h/dev (ajustar para tamanho da equipe)
- 3 kill criteria objetivos
- Checkpoints diários
- Definition of Done

### 3. ARTEFATOS A GERAR

Criar em `ops/issue-audit/`:

#### 3.1 BACKLOG_ORDER.md
Tabela markdown ordenada por (WSJF+RICE)/2, respeitando dependências:

| ID | Título | Type | Area | Priority | WSJF | RICE | Dependencies | Effort | Risk | Status | Rationale |
|----|--------|------|------|----------|------|------|--------------|--------|------|--------|-----------|

#### 3.2 ISSUE_FIXUPS.md
Para cada issue com problemas:
```markdown
## Issue #N: [título original]

### Problemas Detectados
- [ ] Problema 1
- [ ] Problema 2

### ANTES / DEPOIS (proposto)
[comparação lado a lado]

### Comentário Pronto para Issue
[texto pronto em Markdown]
```

#### 3.3 DUPLICATES_AND_MERGES.md
Lista de pares duplicados com comentários prontos

#### 3.4 UNBLOCKING_PLAN.md
Planos de ação para cada issue bloqueada

#### 3.5 SPRINT_PLAN.md
Sprint recomendado com meta, escopo, capacity, riscos, kill criteria, DoD

#### 3.6 backlog_order.csv
Mesmas colunas de BACKLOG_ORDER.md em CSV

#### 3.7 AUDIT_LOG.json
Metadata completa:
```json
{
  "timestamp": "ISO-8601",
  "total_issues": N,
  "calculation_version": "1.0",
  "criteria": {
    "wsjf": "formula",
    "rice": "formula"
  },
  "decisions": [
    {"issue": N, "action": "...", "reason": "..."}
  ]
}
```

#### 3.8 apply_changes.sh
Script bash executável com comandos `gh`:
```bash
#!/bin/bash
set -e

# Criar labels de risco se não existirem
gh label create "risk/low" --description "Low risk" --color "C2E0C6" 2>/dev/null || true
gh label create "risk/med" --description "Medium risk" --color "FBCA04" 2>/dev/null || true
gh label create "risk/high" --description "High risk" --color "D93F0B" 2>/dev/null || true

# Aplicar mudanças em lotes
gh issue edit N --add-label "risk/..."
gh issue edit N --remove-label "priority: PX" --add-label "priority: PY"
gh issue comment N --body "Rationale..."
```

#### 3.9 EXECUTIVE_SUMMARY.md
Resumo executivo com todas as métricas principais

#### 3.10 README.md
Quick start guide para navegar os artefatos

#### 3.11 FINAL_REPORT.txt
Relatório visual formatado com arte ASCII

### 4. RESUMO EXECUTIVO

Imprimir ao final:
```
=== AUDIT SUMMARY ===
Total Issues: N
✅ Adequate Quality: X (Y%)
🔄 Need Fixups: X (Y%)
🔁 Duplicates Found: X pairs
🚫 Blocked Issues: X
📊 Priority Reclassifications: X
⚠️  Residual Risk: [low/med/high]

TOP 10 BY VALUE (WSJF+RICE):
1. #N: [...] - WSJF=X, RICE=Y
...

RECOMMENDED SPRINT:
- Total Effort: Xh
- Issue Count: N
- Expected ROI: [high/med/low]
- Confidence: [high/med/low]

NEXT STEPS:
1. Review FINAL_REPORT.txt (15 min)
2. Validate BACKLOG_ORDER.md top 20 (30 min)
3. Apply changes: cd ops/issue-audit && ./apply_changes.sh
4. Start sprint Monday

METRICS (Track Weekly):
% P0 Issues:        Current → Target
% Adequate Quality: Current → Target
% Blocked:          Current → Target
High-Risk Issues:   Current → Target
```

### 5. APLICAÇÃO CONTROLADA

Após gerar artefatos, perguntar ao usuário:

**"Revisar artefatos gerados em ops/issue-audit/. Digite 'APLICAR AGORA' para executar mudanças no GitHub."**

Se autorizado:
1. Criar labels de risco (se não existirem)
2. Executar `./apply_changes.sh`
3. Reportar sucesso/falha por issue
4. Mostrar estatísticas pós-aplicação

### 6. IDEMPOTÊNCIA

- Gravar `ops/issue-audit/AUDIT_LOG.json` com hash das issues
- Se rodar novamente, detectar drift e mostrar apenas delta
- Permitir re-auditoria para acompanhar progresso semanal

---

## CRITÉRIOS DE ACEITE

✅ Todas issues terão título padronizado
✅ Descrições completas com contexto/objetivo/critérios
✅ Labels coerentes (type, area, priority, status, size, risk)
✅ Métricas WSJF e RICE calculadas
✅ Prioridades reclassificadas conforme regras
✅ Dependências mapeadas sem ciclos
✅ Duplicatas resolvidas
✅ Sprint proposta viável
✅ Artefatos completos gerados
✅ Script de aplicação pronto

---

## CONFIGURAÇÃO

**Modelo recomendado**: Sonnet (análise complexa)
**Timeout**: 10 minutos
**Artefatos**: 11+ arquivos em ops/issue-audit/
**Comandos gh**: ~40 operações

---

## TROUBLESHOOTING

**Erro "label not found"**:
```bash
gh label create "risk/low" --description "Low risk" --color "C2E0C6"
gh label create "risk/med" --description "Medium risk" --color "FBCA04"
gh label create "risk/high" --description "High risk" --color "D93F0B"
```

**Re-auditar progresso**:
```bash
cd ops/issue-audit
gh issue list --limit 1000 --state all --json number,title,body,state,labels,assignees,milestone,createdAt,updatedAt,url > raw_issues.json
node analyze.js && node stats.js
```

**Ver mudanças desde última auditoria**:
```bash
cd ops/issue-audit
diff BACKLOG_ORDER.md BACKLOG_ORDER.md.backup
```
