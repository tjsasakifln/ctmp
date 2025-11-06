# QuickStart - MVP Legal Bot

Instruções rápidas para colocar o sistema no ar em 5 minutos.

## Pré-requisitos

- Node.js 20+
- Docker Desktop (ou Docker + Docker Compose)
- Git

## Passo a Passo

### 1. Clonar e navegar

```bash
cd apps/backend
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Criar arquivo .env

```bash
cp .env.example .env
```

**Editar `.env` com valores mínimos:**

```env
WHATSAPP_VERIFY_TOKEN=meu-token-secreto-123
WHATSAPP_ACCESS_TOKEN=fake-token-para-desenvolvimento
WHATSAPP_PHONE_NUMBER_ID=123456789

DATABASE_URL=postgres://postgres:postgres@localhost:5432/legalbot
REDIS_URL=redis://localhost:6379

# Mock providers (padrão para desenvolvimento)
DATAJUD_PROVIDER=mock
DJEN_PROVIDER=mock
PAYMENTS_PROVIDER=mock
CALENDAR_PROVIDER=mock
```

### 4. Subir serviços (PostgreSQL + Redis)

```bash
docker-compose up -d postgres redis
```

Aguarde ~5 segundos para os serviços iniciarem.

### 5. Executar migrações

```bash
npm run db:generate
npm run db:migrate
```

### 6. Popular banco com dados de teste

```bash
npm run db:seed
```

### 7. Iniciar servidor

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

### 8. Testar

```bash
# Em outro terminal
curl http://localhost:3000/healthz
```

**Resposta esperada:**

```json
{
  "ok": true,
  "status": "healthy"
}
```

## Testar Webhook WhatsApp Localmente

### Opção 1: Simular com cURL

```bash
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
            "phone_number_id": "123456789012345"
          },
          "contacts": [{
            "profile": { "name": "João Silva" },
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

### Opção 2: Expor com ngrok (para testar com WhatsApp real)

```bash
# Instalar ngrok: https://ngrok.com/download
ngrok http 3000

# Copiar URL (ex: https://abc123.ngrok.io)
# Configurar no Meta for Developers:
# Webhook URL: https://abc123.ngrok.io/webhooks/whatsapp
# Verify Token: meu-token-secreto-123
```

## Testar Ferramentas HTTP

```bash
# Consulta DataJud (mock)
curl -X POST http://localhost:3000/tools/consulta_datajud \
  -H "Content-Type: application/json" \
  -d '{"nup": "0001234-56.2024.8.24.0001"}'

# Buscar cliente
curl -X POST http://localhost:3000/tools/buscar_cliente_por_whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+5548999990001"}'
```

## Visualizar Logs

Os logs são estruturados e pretty-printed em desenvolvimento:

```
[14:30:00] INFO (request-id): Processando mensagem WhatsApp
    from: "+5548999990001"
    messageBody: "Oi"
[14:30:01] INFO (request-id): Cliente identificado
    clientId: "11111111-1111-1111-1111-111111111111"
[14:30:02] INFO (request-id): Consultando DataJud
    nup: "0001234-56.2024.8.24.0001"
```

## Acessar Banco de Dados

```bash
# Via psql
psql postgres://postgres:postgres@localhost:5432/legalbot

# Ou via Drizzle Studio (UI)
npm run db:studio
```

## Próximos Passos

- Ler [README.md](apps/backend/README.md) completo
- Executar testes: `npm test`
- Ver [TESTING.md](apps/backend/TESTING.md) para testes manuais
- Configurar WhatsApp Cloud API real
- Trocar providers de mock para HTTP em produção

## Troubleshooting

### "Cannot connect to database"

```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Reiniciar se necessário
docker-compose restart postgres
```

### "Redis connection refused"

```bash
# Verificar Redis
docker ps | grep redis

# Reiniciar
docker-compose restart redis
```

### "Port 3000 already in use"

```bash
# Trocar porta no .env
PORT=3001
```

## Parar Serviços

```bash
# Parar servidor (Ctrl+C no terminal do npm run dev)

# Parar Docker Compose
docker-compose down

# Remover volumes (limpa banco de dados)
docker-compose down -v
```

## Estrutura de Pastas

```
apps/backend/
├── src/                # Código-fonte
├── test/               # Testes
├── .env                # Variáveis de ambiente (você cria)
├── docker-compose.yml  # PostgreSQL + Redis
├── package.json        # Dependências e scripts
└── README.md          # Documentação completa
```

## Comandos Úteis

```bash
npm run dev          # Desenvolvimento com hot-reload
npm run build        # Build para produção
npm start            # Rodar build de produção
npm test             # Executar testes
npm run lint         # Linter
npm run format       # Formatação de código
npm run db:migrate   # Rodar migrações
npm run db:seed      # Popular banco com dados de teste
npm run db:studio    # UI para o banco (Drizzle Studio)
```

## Pronto!

Seu MVP está rodando. Acesse `http://localhost:3000/healthz` para confirmar.

Para documentação completa, veja [README.md](apps/backend/README.md).
