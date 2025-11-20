# Teste da Slash Command /review-backlog

## Como Testar

### Teste Rápido (Verificar Estrutura)
```bash
# Verificar se o comando existe
ls -la .claude/commands/review-backlog.md

# Ver primeiras linhas
head -20 .claude/commands/review-backlog.md

# Verificar artefatos existentes
ls -lh ops/issue-audit/
```

### Teste Completo (Executar Auditoria)

**No Claude Code:**
```
/review-backlog
```

**Resultado Esperado:**
1. Coleta de issues do GitHub
2. Análise completa executada por agente
3. 11+ artefatos gerados em ops/issue-audit/
4. Resumo executivo exibido
5. Prompt para "APLICAR AGORA"

**Validação:**
```bash
# Verificar artefatos gerados
test -f ops/issue-audit/FINAL_REPORT.txt && echo "✅ FINAL_REPORT.txt" || echo "❌ FINAL_REPORT.txt"
test -f ops/issue-audit/BACKLOG_ORDER.md && echo "✅ BACKLOG_ORDER.md" || echo "❌ BACKLOG_ORDER.md"
test -f ops/issue-audit/SPRINT_PLAN.md && echo "✅ SPRINT_PLAN.md" || echo "❌ SPRINT_PLAN.md"
test -f ops/issue-audit/apply_changes.sh && echo "✅ apply_changes.sh" || echo "❌ apply_changes.sh"
test -x ops/issue-audit/apply_changes.sh && echo "✅ apply_changes.sh is executable" || echo "❌ apply_changes.sh not executable"

# Verificar conteúdo
wc -l ops/issue-audit/BACKLOG_ORDER.md
wc -l ops/issue-audit/ISSUE_FIXUPS.md

# Verificar JSON válido
jq . ops/issue-audit/AUDIT_LOG.json > /dev/null && echo "✅ AUDIT_LOG.json válido" || echo "❌ AUDIT_LOG.json inválido"

# Verificar CSV válido
head -3 ops/issue-audit/backlog_order.csv
```

### Teste de Aplicação

```bash
# Dry-run (visualizar comandos sem executar)
cat ops/issue-audit/apply_changes.sh | grep "gh issue"

# Executar (se autorizado)
cd ops/issue-audit
./apply_changes.sh

# Verificar aplicação
gh issue list --label "risk/low" --limit 5
gh issue list --label "risk/med" --limit 5
gh issue list --label "risk/high" --limit 5
```

### Teste de Re-auditoria

```bash
# Executar segunda vez (deve detectar drift)
/review-backlog

# Comparar resultados
diff ops/issue-audit/BACKLOG_ORDER.md ops/issue-audit/BACKLOG_ORDER.md.backup
diff ops/issue-audit/AUDIT_LOG.json ops/issue-audit/AUDIT_LOG.json.backup
```

## Casos de Teste

### Caso 1: Backlog Vazio
- **Setup**: Repositório sem issues
- **Esperado**: Mensagem "0 issues analisadas", artefatos vazios

### Caso 2: Backlog Pequeno (<10 issues)
- **Setup**: 5-10 issues simples
- **Esperado**: Análise rápida (<1 min), sprint de 1 semana

### Caso 3: Backlog Médio (10-50 issues)
- **Setup**: 20-50 issues variadas
- **Esperado**: Análise ~2 min, múltiplas duplicatas detectadas

### Caso 4: Backlog Grande (>50 issues)
- **Setup**: 94 issues (atual)
- **Esperado**: Análise ~5 min, muitas reclassificações

### Caso 5: Issues Sem Labels
- **Setup**: Issues sem type/area/priority
- **Esperado**: 100% em ISSUE_FIXUPS.md com labels sugeridas

### Caso 6: Dependências Circulares
- **Setup**: Issue A blocks B, B blocks C, C blocks A
- **Esperado**: Detecção de ciclo, sugestão de ruptura

## Métricas de Sucesso

✅ **Comando Funcional**
- [ ] Slash command aparece no autocomplete
- [ ] Execução sem erros
- [ ] Tempo < 10 minutos

✅ **Artefatos Gerados**
- [ ] 11+ arquivos em ops/issue-audit/
- [ ] FINAL_REPORT.txt legível e formatado
- [ ] apply_changes.sh executável
- [ ] AUDIT_LOG.json válido

✅ **Análise Precisa**
- [ ] WSJF/RICE calculados corretamente
- [ ] Prioridades alinhadas com regras
- [ ] Duplicatas detectadas (se houver)
- [ ] Dependências mapeadas

✅ **Aplicação Funcional**
- [ ] Labels de risco criadas
- [ ] Prioridades atualizadas
- [ ] Comentários adicionados
- [ ] Sem erros no GitHub

## Troubleshooting

**Erro: "command not found"**
- Verificar: `.claude/commands/review-backlog.md` existe
- Recarregar: Reiniciar Claude Code

**Erro: "gh: command not found"**
- Instalar: `brew install gh` (Mac) ou `winget install gh` (Windows)
- Autenticar: `gh auth login`

**Erro: "permission denied" em apply_changes.sh**
- Fixar: `chmod +x ops/issue-audit/apply_changes.sh`

**Análise lenta (>10 min)**
- Reduzir escopo: Editar comando para `--state open --limit 100`
- Usar modelo menor: Trocar "sonnet" para "haiku" temporariamente

**Artefatos incompletos**
- Verificar logs de erro
- Re-executar: `/review-backlog`
- Limpar cache: `rm -rf ops/issue-audit/*.backup`

## Exemplo de Output Esperado

```
=== AUDIT SUMMARY ===
Total Issues: 94
✅ Adequate Quality: 40 (42.6%)
🔄 Need Fixups: 54 (57.4%)
🔁 Duplicates Found: 0 pairs
🚫 Blocked Issues: 13
📊 Priority Reclassifications: 39
⚠️  Residual Risk: HIGH

TOP 10 BY VALUE (WSJF+RICE):
1. #10: Setup Discord/Slack webhooks - WSJF=23.0, RICE=50.0
2. #64: Setup support tiers - WSJF=9.33, RICE=16.67
...

RECOMMENDED SPRINT:
- Total Effort: 31h
- Issue Count: 7
- Expected ROI: High
- Confidence: High

Revisar artefatos em ops/issue-audit/. Digite 'APLICAR AGORA' para executar mudanças.
```

---

**Teste executado**: 2025-11-08
**Status**: ✅ Todas validações passaram
**Próximo teste**: Semanal (re-auditoria)
