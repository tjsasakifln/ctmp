# MVP Sistema de Atendimento Jurídico por WhatsApp

Sistema de atendimento jurídico automatizado via WhatsApp com consulta oficial ao andamento processual (DataJud/DJEN) e agendamento pago.

## Stack

- **Runtime:** Node.js 20+
- **Framework:** Fastify (HTTP server)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Drizzle ORM
- **Jobs:** BullMQ + Redis
- **WhatsApp:** WhatsApp Business Cloud API
- **TypeScript:** Tipagem rigorosa com Zod para validação

## Princípios

- Confiabilidade: retry exponencial, rate limiting, idempotência
- Rastreabilidade: logs estruturados (Pino) com request_id, client_id, case_id
- Zero alucinação: tradutor determinístico de juridiquês (dicionário local, sem LLM)
- Código testável: Vitest + mocks, cobertura >80%
- DX impecável: scripts prontos, Docker Compose, exemplos completos

## Estrutura do Projeto

```
apps/backend/
├── src/
│   ├── config/          # Configuração (env, database, logger, queues)
│   ├── core/            # Lógica de negócio central (tradutor de juridiquês)
│   ├── adapters/        # Integrações externas
│   │   ├── whatsapp/    # Cliente WhatsApp Cloud API
│   │   ├── datajud/     # Provider DataJud (mock + http)
│   │   ├── djen/        # Provider DJEN (mock + http)
│   │   ├── payments/    # Provider de pagamentos (mock + http)
│   │   └── calendar/    # Provider Google Calendar (mock + http)
│   ├── features/        # Módulos de funcionalidade
│   │   ├── clients/     # Gestão de clientes
│   │   ├── cases/       # Gestão de processos
│   │   ├── notifications/ # WhatsApp handler e repositório
│   │   └── tools/       # Endpoints HTTP para Agent Builder
│   ├── jobs/            # Workers BullMQ
│   ├── routes/          # Rotas Fastify
│   ├── types/           # Tipos TypeScript
│   └── utils/           # Utilitários (validadores, erros)
├── test/                # Testes (Vitest)
├── docker-compose.yml   # PostgreSQL + Redis
├── Dockerfile           # Build de produção
├── .env.example         # Template de variáveis de ambiente
└── README.md            # Este arquivo
```

## Instalação

### 1. Clonar e instalar dependências

```bash
cd apps/backend
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

**Variáveis obrigatórias:**

```env
# WhatsApp Cloud API
WHATSAPP_VERIFY_TOKEN=seu-token-secreto-aqui
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345

# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/legalbot

# Redis
REDIS_URL=redis://localhost:6379
```

### 3. Iniciar serviços com Docker Compose

```bash
docker-compose up -d postgres redis
```

### 4. Gerar e executar migrações

```bash
npm run db:generate
npm run db:migrate
```

### 5. (Opcional) Popular banco com dados de teste

```bash
npm run db:seed
```

### 6. Iniciar servidor em modo desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

## Configuração do Webhook WhatsApp

1. Acesse o [Meta for Developers](https://developers.facebook.com/)
2. Vá em **WhatsApp > Configuration > Webhook**
3. Configure:
   - **Callback URL:** `https://seu-dominio.com/webhooks/whatsapp`
   - **Verify Token:** O valor de `WHATSAPP_VERIFY_TOKEN` no seu `.env`
4. Subscreva aos eventos: `messages`

## Endpoints

### Health Check

```bash
# Verificar se servidor está vivo
curl http://localhost:3000/healthz

# Verificar se banco está conectado
curl http://localhost:3000/readyz
```

### Webhook WhatsApp

```bash
# GET - Verificação (Meta usa isso no setup)
curl "http://localhost:3000/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=seu-token&hub.challenge=test123"

# POST - Receber mensagens (payload do Meta)
curl -X POST http://localhost:3000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "123",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "5548999990000",
            "phone_number_id": "123456789"
          },
          "contacts": [{
            "profile": { "name": "João" },
            "wa_id": "5548999990001"
          }],
          "messages": [{
            "from": "5548999990001",
            "id": "msg123",
            "timestamp": "1672531200",
            "type": "text",
            "text": { "body": "Oi" }
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

### Ferramentas HTTP (Agent Builder)

#### 1. Consulta DataJud

```bash
curl -X POST http://localhost:3000/tools/consulta_datajud \
  -H "Content-Type: application/json" \
  -d '{
    "nup": "0001234-56.2024.8.24.0001"
  }'
```

**Resposta:**

```json
{
  "ok": true,
  "movements": [
    {
      "codigo": "SENTENCA",
      "titulo": "Sentença proferida",
      "descricao": "Sentença de procedência do pedido...",
      "data_evento": "2025-01-05T14:30:00Z",
      "origem": "datajud"
    }
  ],
  "last_seen": "2025-01-05T14:30:00Z"
}
```

#### 2. Consulta DJEN

```bash
curl -X POST http://localhost:3000/tools/consulta_djen \
  -H "Content-Type: application/json" \
  -d '{
    "tribunal": "TJSC",
    "data_inicio": "2025-01-01",
    "data_fim": "2025-01-31",
    "nup": "0001234-56.2024.8.24.0001"
  }'
```

**Resposta:**

```json
{
  "ok": true,
  "publicacoes": [
    {
      "codigo": "DJEN-20251105-001",
      "titulo": "Publicação de sentença",
      "descricao": "Publicada sentença de procedência...",
      "data_evento": "2025-01-05T08:00:00Z",
      "origem": "djen"
    }
  ]
}
```

#### 3. Buscar Cliente por WhatsApp

```bash
curl -X POST http://localhost:3000/tools/buscar_cliente_por_whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+5548999990001"
  }'
```

**Resposta:**

```json
{
  "ok": true,
  "data": {
    "cliente": {
      "id": "uuid",
      "nome": "João Silva",
      "nup": "0001234-56.2024.8.24.0001"
    }
  }
}
```

#### 4. Agendar Consulta

```bash
curl -X POST http://localhost:3000/tools/agendar_consulta \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "11111111-1111-1111-1111-111111111111",
    "slot": "2025-11-08T14:00:00-03:00"
  }'
```

**Resposta:**

```json
{
  "ok": true,
  "data": {
    "meeting_url": "https://meet.google.com/xxx-yyyy-zzz"
  }
}
```

#### 5. Emitir Cobrança

```bash
curl -X POST http://localhost:3000/tools/emitir_cobranca \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "11111111-1111-1111-1111-111111111111",
    "valor": 350.00,
    "descricao": "Consulta jurídica inicial"
  }'
```

**Resposta:**

```json
{
  "ok": true,
  "data": {
    "payment_url": "https://pay.mock.example.com/abc123"
  }
}
```

## Fluxos de Negócio

### Fluxo 1: Cliente com NUP

1. Cliente envia "Oi" via WhatsApp
2. Sistema busca cliente no banco (por telefone)
3. Se cliente tem NUP mapeado:
   - Consulta DataJud e DJEN (últimos 7 dias)
   - Combina eventos e ordena por data
   - Traduz juridiquês para português simples
   - Envia resumo formatado via WhatsApp

**Exemplo de resposta:**

```
Olá! Consultei o andamento do seu processo 0001234-56.2024.8.24.0001.

Última atualização:
*Sentença proferida*
📅 05/01/2025 às 14:30

Sentença de procedência do pedido, julgando procedente a ação.

_Foram encontradas 3 movimentações nos últimos 7 dias._
```

### Fluxo 2: Cliente Novo

1. Cliente envia "Oi" via WhatsApp
2. Sistema não encontra cliente no banco
3. Cria registro de cliente
4. Envia mensagem pedindo NUP e oferecendo consulta paga

**Exemplo de resposta:**

```
Olá, João!

Para consultar o andamento do seu processo, preciso do *número do processo (NUP)*.

📋 Formato: NNNNNNN-DD.AAAA.J.TT.OOOO
Exemplo: 0001234-56.2024.8.24.0001

Se você não tem o número do processo ou deseja agendar uma consulta jurídica paga, entre em contato conosco.

_Para consultas pagas, o valor é R$ 350,00._
```

### Fluxo 3: Notificações Automáticas (Job Diário)

1. Job executa às 08:00 BRT (via cron)
2. Para cada processo ativo:
   - Consulta DataJud e DJEN
   - Compara com último evento salvo no banco
   - Se houver novidades:
     - Salva evento no banco
     - Verifica idempotência (chave única)
     - Enfileira notificação WhatsApp
3. Worker processa fila de notificações:
   - Formata mensagem com tradutor de juridiquês
   - Envia para cliente via WhatsApp
   - Marca notificação como enviada

**Exemplo de notificação:**

```
🔔 *Nova Publicação no seu processo*

Processo: *0001234-56.2024.8.24.0001*

*Publicação de sentença*
📅 05/01/2025 às 08:00

Publicada sentença de procedência nos autos do processo.

_Você pode me enviar uma mensagem a qualquer momento para consultar o andamento._
```

## Tradutor de Juridiquês

O sistema usa um tradutor **determinístico** (sem IA) baseado em dicionário local (`src/core/legal_dict.json`).

**Exemplos:**

| Juridiquês                  | Português Simples                      |
| --------------------------- | -------------------------------------- |
| Concluso                    | Com o juiz para decisão                |
| Juntada de petição          | Petição anexada ao processo            |
| Expedição de mandado        | Foi emitida uma ordem oficial          |
| Intimação                   | Convocação formal para manifestação    |
| Sentença proferida          | Juiz decidiu o processo                |
| Trânsito em julgado         | Decisão final, sem possibilidade de recurso |

Para adicionar novos termos, edite `src/core/legal_dict.json`.

## Jobs e Filas (BullMQ)

### Filas

- **check-djen:** Verifica novas publicações no DJEN
- **check-datajud:** Verifica novas movimentações no DataJud
- **send-notification:** Envia notificações WhatsApp

### Workers

Cada worker processa jobs de forma concorrente e com retry automático.

Para habilitar workers em desenvolvimento:

```bash
ENABLE_WORKERS=true npm run dev
```

Em produção, workers iniciam automaticamente.

### Monitoramento de Filas

```bash
# Visualizar dashboard do BullMQ (opcional)
npx bull-board
```

## Logs e Observabilidade

### Logs Estruturados

Todos os logs seguem formato JSON (via Pino) com:

- `requestId`: ID único da requisição
- `clientId`: ID do cliente (quando disponível)
- `caseId`: ID do processo (quando disponível)
- `level`: `info`, `warn`, `error`

**Exemplo:**

```json
{
  "level": "info",
  "time": 1673025600000,
  "requestId": "abc123",
  "clientId": "uuid",
  "caseId": "uuid",
  "msg": "Consultando DataJud",
  "nup": "0001234-56.2024.8.24.0001"
}
```

### Rate Limiting

- 100 requisições por minuto por IP
- Exceção: `127.0.0.1` (localhost)

### Tratamento de Erros

Todos os erros são logados e mapeados para códigos HTTP:

- `VALIDATION_ERROR` → 400
- `NOT_FOUND` → 404
- `UNAUTHORIZED` → 401
- `RATE_LIMIT_EXCEEDED` → 429
- `EXTERNAL_SERVICE_ERROR` → 502
- `INTERNAL_ERROR` → 500

## Testes

### Executar testes

```bash
# Todos os testes
npm test

# Com cobertura
npm run test:coverage

# Watch mode
npm run test:watch
```

### Cobertura Mínima

- Linhas: 80%
- Funções: 80%
- Branches: 80%
- Statements: 80%

## Providers (Mock vs HTTP)

Por padrão, todos os adapters usam **mock providers** para desenvolvimento.

### Trocar para HTTP (produção)

Edite `.env`:

```env
DATAJUD_PROVIDER=http
DATAJUD_API_URL=https://api-publica.datajud.cnj.jus.br
DATAJUD_API_KEY=seu-api-key

DJEN_PROVIDER=http
DJEN_API_URL=https://djen.example.com/api
DJEN_API_KEY=seu-api-key

PAYMENTS_PROVIDER=http
PAYMENTS_API_URL=https://payments.example.com/api
PAYMENTS_API_KEY=seu-api-key
```

## Limitações e TODOs

### Implementação Atual (MVP)

- Providers DataJud e DJEN usam mocks (fixtures)
- Integração real requer API keys e contratos oficiais
- Google Calendar provider não implementado (apenas stub)
- Um NUP por cliente (para múltiplos, adicionar lógica de seleção)
- Sem suporte a templates WhatsApp customizados (apenas texto)

### Próximos Passos

1. Integrar API real do DataJud (CNJ)
2. Integrar DJEN dos tribunais estaduais
3. Implementar Google Calendar OAuth2
4. Adicionar suporte a múltiplos processos por cliente
5. Criar templates WhatsApp no Meta Business Suite
6. Adicionar feature flag para OpenAI Agent Builder
7. Implementar dashboard de administração
8. Adicionar métricas (Prometheus)

## Segurança

### Checklist

- [ ] Helmet habilitado (headers de segurança)
- [ ] Rate limiting por IP
- [ ] Validação de entrada com Zod
- [ ] Sanitização de SQL (Drizzle ORM parameterizado)
- [ ] Secrets via variáveis de ambiente
- [ ] Logs sem tokens/senhas
- [ ] CORS configurado
- [ ] HTTPS em produção (via proxy reverso)

### LGPD

- Dados mínimos: telefone, nome, CPF (opcional), NUP
- Opt-out: cliente pode enviar "SAIR" (TODO: implementar)
- Retenção: definir política (ex: 1 ano sem movimentação)

## Deploy (Docker)

### Build

```bash
docker build -t legalbot-backend .
```

### Run

```bash
docker-compose up -d
```

### Variáveis de Ambiente em Produção

Configure via `docker-compose.yml` ou secrets do orquestrador (Kubernetes, AWS ECS, etc.).

## Suporte

Para problemas ou dúvidas, abra uma issue no repositório.

## Licença

MIT
