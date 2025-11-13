# Issue #1: Fix ESLint v9 Configuration

## 🎯 Objetivo
Migrar configuração ESLint de formato v8 (.eslintrc.json) para v9 (eslint.config.js) para resolver erro de linting no CI workflow.

## 📋 Contexto
**Problema Atual:**
- ESLint v9.39.1 instalado via package.json
- Configuração em formato antigo (.eslintrc.json)
- Comando `npm run lint` falha com erro: "ESLint couldn't find an eslint.config.(js|mjs|cjs) file"
- Bloqueador para CI workflow funcionar

**Impacto:**
- CI workflow vai FALHAR no job `lint`
- Impossível mergear PRs com linting quebrado
- Bloqueia Fase 1 (Semana 1) do ROADMAP

## ✅ Critérios de Aceitação

1. [ ] Arquivo `eslint.config.js` criado em `apps/backend/`
2. [ ] Configuração migrada mantendo mesmas regras:
   - parser: @typescript-eslint/parser
   - plugins: @typescript-eslint
   - extends: eslint:recommended + typescript-eslint/recommended
   - rules customizadas preservadas
3. [ ] Arquivo `.eslintrc.json` removido
4. [ ] Comando `npm run lint` executa sem erros
5. [ ] Nenhum novo warning/error de lint introduzido
6. [ ] Documentação atualizada (se necessário)

## 🔧 Detalhes Técnicos

**Arquivos Afetados:**
- `apps/backend/.eslintrc.json` (remover)
- `apps/backend/eslint.config.js` (criar)
- `apps/backend/package.json` (verificar se precisa ajustes)

**Configuração Atual (.eslintrc.json):**
```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": "warn"
  },
  "env": {
    "node": true,
    "es2022": true
  }
}
```

**Nova Configuração (eslint.config.js):**
```javascript
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        node: true,
        es2022: true,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
    },
  },
];
```

**Comandos para Testar:**
```bash
cd apps/backend
npm install
npm run lint            # Deve executar sem erros
npm run lint -- --fix   # Deve corrigir issues auto-fixable
```

## 📦 Dependências
- **Bloqueia:** Issue #2 (Validar CI workflow)
- **Bloqueia:** Todas as PRs futuras
- **Depende de:** Nenhuma (pode ser feita agora)

## 🏷️ Labels
- `priority: critical`
- `type: bug`
- `area: ci-cd`
- `effort: 2-3h`
- `phase: 1-week-1`

## 📚 Referências
- [ESLint v9 Migration Guide](https://eslint.org/docs/latest/use/configure/migration-guide)
- [TypeScript ESLint v9 Config](https://typescript-eslint.io/getting-started)
- ROADMAP.md - Fase 1, Semana 1, Tarefa 1.3

## ✍️ Notas para Implementação
1. Testar com `npm run lint` antes de commitar
2. Verificar se todos os arquivos `.ts` são linted
3. Garantir que mesmas regras são aplicadas
4. CI deve passar após merge

## 🎯 Milestone
**Fase 1: Preparação para Produção MVP** - Semana 1

## ⏱️ Estimativa
**2-3 horas** (pesquisa + implementação + testes)
