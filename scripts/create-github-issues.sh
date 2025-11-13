#!/bin/bash
# Script para criar issues reais no GitHub a partir dos templates em docs/issues/

set -e

echo "🚀 Criando issues no GitHub..."
echo ""

# Issue #1 - RESOLVED (criar como closed)
echo "📝 Issue #1: Fix ESLint Errors (RESOLVED)..."
gh issue create \
  --title "Fix ESLint Errors" \
  --body-file docs/issues/001-fix-eslint-v9-config.md \
  --label "priority: critical,type: bug,area: code-quality,phase: 1-week-1" \
  --assignee "@me"

# Fechar imediatamente pois já foi resolvida
ISSUE_1=$(gh issue list --limit 1 --json number --jq '.[0].number')
gh issue close $ISSUE_1 --comment "✅ Resolved in commit cb2edaf"

echo "✅ Issue #1 criada e fechada"
echo ""

# Issue #2 - Validate CI Workflow
echo "📝 Issue #2: Validate CI Workflow Locally..."
gh issue create \
  --title "Validate CI Workflow Locally" \
  --body-file docs/issues/002-validate-ci-workflow.md \
  --label "priority: high,type: validation,area: ci-cd,phase: 1-week-1,effort: 2-3h" \
  --assignee "@me"

echo "✅ Issue #2 criada"
echo ""

# Issue #3 - Configure GitHub Environments
echo "📝 Issue #3: Configure GitHub Environments..."
gh issue create \
  --title "Configure GitHub Environments and Secrets" \
  --body-file docs/issues/003-configure-github-environments.md \
  --label "priority: high,type: configuration,area: ci-cd,phase: 1-week-1,effort: 1-2h" \
  --assignee "@me"

echo "✅ Issue #3 criada"
echo ""

# Issue #4 - Setup Railway Staging
echo "📝 Issue #4: Setup Railway Staging Environment..."
gh issue create \
  --title "Setup Railway Staging Environment" \
  --body-file docs/issues/004-setup-railway-staging.md \
  --label "priority: high,type: infrastructure,area: deployment,phase: 1-week-1,effort: 3-4h" \
  --assignee "@me"

echo "✅ Issue #4 criada"
echo ""

# Issue #5 - Add Correlation IDs
echo "📝 Issue #5: Add Correlation IDs to Logs..."
gh issue create \
  --title "Add Correlation IDs to Structured Logs" \
  --body-file docs/issues/005-add-correlation-ids-logs.md \
  --label "priority: medium,type: enhancement,area: observability,phase: 1-week-2,effort: 3-4h" \
  --assignee "@me"

echo "✅ Issue #5 criada"
echo ""

# Issue #6 - Metrics Endpoint
echo "📝 Issue #6: Implement Metrics Endpoint..."
gh issue create \
  --title "Implement Prometheus Metrics Endpoint" \
  --body-file docs/issues/006-implement-metrics-endpoint.md \
  --label "priority: high,type: feature,area: observability,phase: 1-week-2,effort: 4-6h" \
  --assignee "@me"

echo "✅ Issue #6 criada"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Todas as issues foram criadas no GitHub!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Verifique em: https://github.com/tjsasakifln/ctmp/issues"
echo ""
echo "Issues criadas:"
echo "  ✅ #1 - Fix ESLint Errors (CLOSED)"
echo "  📋 #2 - Validate CI Workflow Locally"
echo "  📋 #3 - Configure GitHub Environments"
echo "  📋 #4 - Setup Railway Staging"
echo "  📋 #5 - Add Correlation IDs to Logs"
echo "  📋 #6 - Implement Metrics Endpoint"
