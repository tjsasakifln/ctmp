# Custom Slash Commands

Comandos customizados para automação de processos no projeto CTMP.

## 📋 Comandos Disponíveis

### /review-backlog

**Descrição**: Auditoria completa do backlog com análise WSJF+RICE+Risk

**Quando usar**:
- Início de sprint (planejamento)
- Fim de sprint (retrospectiva)
- Quando backlog atingir >50 issues
- Mensalmente para higiene do backlog

**O que faz**:
1. ✅ Coleta todas issues/PRs do GitHub
2. ✅ Valida qualidade (título, descrição, labels, atomicidade)
3. ✅ Detecta duplicatas (similaridade ≥0.85)
4. ✅ Mapeia dependências e bloqueios (grafo PERT)
5. ✅ Classifica riscos (security, PII, billing, dados)
6. ✅ Calcula métricas WSJF e RICE
7. ✅ Reclassifica prioridades (P0-P3)
8. ✅ Gera 11+ artefatos executivos
9. ✅ Cria script de aplicação automática
10. ✅ Recomenda sprint otimizada

**Artefatos gerados** (em `ops/issue-audit/`):
- `FINAL_REPORT.txt` - Relatório visual completo ⭐
- `EXECUTIVE_SUMMARY.md` - Findings executivos
- `BACKLOG_ORDER.md` - Backlog priorizado com scores
- `ISSUE_FIXUPS.md` - Melhorias para issues inadequadas
- `SPRINT_PLAN.md` - Sprint recomendada
- `UNBLOCKING_PLAN.md` - Planos de desbloqueio
- `DUPLICATES_AND_MERGES.md` - Detecção de duplicatas
- `backlog_order.csv` - Dados em CSV
- `AUDIT_LOG.json` - Metadata da auditoria
- `apply_changes.sh` - Script de aplicação automática
- `analyze.js` - Motor de análise (reutilizável)

**Uso**:
```bash
/review-backlog
# Aguardar análise completa (~2-5 min)
# Revisar artefatos em ops/issue-audit/
# Digite "APLICAR AGORA" para executar mudanças
```

**Frequência recomendada**: Semanal ou quinzenal

**Tempo de execução**: 2-5 minutos (depende do número de issues)

**Requisitos**:
- GitHub CLI (`gh`) instalado e autenticado
- Node.js (para scripts de análise)
- Permissões de escrita no repositório

---

## 🔧 Manutenção

### Re-auditar progresso

```bash
cd ops/issue-audit

# Re-coletar issues
gh issue list --limit 1000 --state all --json number,title,body,state,labels,assignees,milestone,createdAt,updatedAt,url > raw_issues.json

# Re-analisar
node analyze.js

# Gerar estatísticas
node stats.js

# Ver mudanças
diff BACKLOG_ORDER.md BACKLOG_ORDER.md.backup
```

### Criar labels de risco

Se as labels `risk/low`, `risk/med`, `risk/high` não existirem:

```bash
gh label create "risk/low" --description "Low risk - minor impact if fails" --color "C2E0C6"
gh label create "risk/med" --description "Medium risk - moderate impact" --color "FBCA04"
gh label create "risk/high" --description "High risk - critical impact (security, data, revenue)" --color "D93F0B"
```

### Limpar cache de auditoria

```bash
rm -rf ops/issue-audit/*.backup
rm -rf ops/issue-audit/raw_*.json
```

---

## 📊 Métricas de Sucesso

Acompanhe semanalmente após cada execução:

| Métrica | Meta | Como Verificar |
|---------|------|----------------|
| % P0 Issues | <30% | Ver `BACKLOG_ORDER.md` |
| % Qualidade Adequada | >90% | Ver `EXECUTIVE_SUMMARY.md` |
| % Issues Bloqueadas | <5% | Ver `UNBLOCKING_PLAN.md` |
| Issues de Alto Risco | <15 | `gh issue list --label "risk/high"` |
| Avg WSJF (top 10) | >8.0 | Ver `BACKLOG_ORDER.md` |

---

## 🐛 Troubleshooting

**Erro: "label not found"**
```bash
# Criar labels de risco manualmente
gh label create "risk/low" --description "Low risk" --color "C2E0C6"
gh label create "risk/med" --description "Medium risk" --color "FBCA04"
gh label create "risk/high" --description "High risk" --color "D93F0B"
```

**Erro: "permission denied" em apply_changes.sh**
```bash
chmod +x ops/issue-audit/apply_changes.sh
```

**Análise muito lenta**
```bash
# Reduzir escopo para issues abertas apenas
gh issue list --state open --limit 100 --json ... > raw_issues.json
```

**Drift detection**
```bash
# Comparar com auditoria anterior
cd ops/issue-audit
diff AUDIT_LOG.json AUDIT_LOG.json.backup | head -50
```

---

## 🎯 Roadmap de Comandos

Próximos comandos planejados:

- [ ] `/sprint-planning` - Planejar sprint baseado em BACKLOG_ORDER.md
- [ ] `/risk-review` - Review focado apenas em issues de alto risco
- [ ] `/quality-check` - Validar qualidade de issues sem re-priorizar
- [ ] `/dependency-graph` - Visualizar grafo de dependências
- [ ] `/metrics-dashboard` - Dashboard de métricas do backlog

---

## 📚 Referências

- [WSJF (Weighted Shortest Job First)](https://www.scaledagileframework.com/wsjf/)
- [RICE Scoring Model](https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/)
- [GitHub CLI Documentation](https://cli.github.com/manual/)

---

**Última atualização**: 2025-11-08
**Versão**: 1.0
**Maintainer**: Engineering Team
