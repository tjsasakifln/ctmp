# Guia de Testes Manuais

Este guia contém sequências de comandos cURL para testar manualmente o sistema.

## Pré-requisitos

1. Servidor rodando: `npm run dev`
2. PostgreSQL e Redis ativos: `docker-compose up -d postgres redis`
3. Banco populado: `npm run db:seed`

## 1. Health Checks

```bash
# Verificar se servidor está vivo
curl http://localhost:3000/healthz

# Verificar conexão com banco
curl http://localhost:3000/readyz
```

**Resposta esperada:**

```json
{
  "ok": true,
  "status": "ready",
  "checks": {
    "database": "ok"
  }
}
```

## 2. Webhook WhatsApp - Verificação

```bash
# Simular verificação do Meta
curl "http://localhost:3000/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=change-me-secret-token&hub.challenge=CHALLENGE_ACCEPTED"
```

**Resposta esperada:** `CHALLENGE_ACCEPTED`

## 3. Webhook WhatsApp - Mensagem de Cliente Existente

```bash
curl -X POST http://localhost:3000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "entry123",
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
            "id": "msg_' $(date +%s) '",
            "timestamp": "' $(date +%s) '",
            "type": "text",
            "text": { "body": "Oi" }
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

**Logs esperados:**

```
[INFO] Processando mensagem WhatsApp
[INFO] Cliente identificado clientId=11111111-1111-1111-1111-111111111111
[INFO] Cliente possui NUP nup=0001234-56.2024.8.24.0001
[INFO] Consultando DataJud
[INFO] Consultando DJEN
[INFO] WhatsApp message sent messageId=wamid.xxx
```

## 4. Webhook WhatsApp - Mensagem de Cliente Novo

```bash
curl -X POST http://localhost:3000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "entry456",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "5548999990000",
            "phone_number_id": "123456789012345"
          },
          "contacts": [{
            "profile": { "name": "Novo Cliente" },
            "wa_id": "5548999999999"
          }],
          "messages": [{
            "from": "5548999999999",
            "id": "msg_new_' $(date +%s) '",
            "timestamp": "' $(date +%s) '",
            "type": "text",
            "text": { "body": "Olá" }
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

**Logs esperados:**

```
[INFO] Processando mensagem WhatsApp
[INFO] Cliente não encontrado, criando novo
[INFO] Cliente sem NUP, enviando instruções
[INFO] WhatsApp message sent
```

## 5. Ferramentas HTTP

### 5.1 Consulta DataJud

```bash
curl -X POST http://localhost:3000/tools/consulta_datajud \
  -H "Content-Type: application/json" \
  -d '{"nup": "0001234-56.2024.8.24.0001"}'
```

**Resposta esperada:**

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

### 5.2 Consulta DJEN

```bash
curl -X POST http://localhost:3000/tools/consulta_djen \
  -H "Content-Type: application/json" \
  -d '{
    "tribunal": "TJSC",
    "data_inicio": "2024-12-01",
    "data_fim": "2025-01-31",
    "nup": "0001234-56.2024.8.24.0001"
  }'
```

**Resposta esperada:**

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

### 5.3 Buscar Cliente

```bash
curl -X POST http://localhost:3000/tools/buscar_cliente_por_whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+5548999990001"}'
```

**Resposta esperada:**

```json
{
  "ok": true,
  "data": {
    "cliente": {
      "id": "11111111-1111-1111-1111-111111111111",
      "nome": "João Silva",
      "nup": "0001234-56.2024.8.24.0001"
    }
  }
}
```

### 5.4 Agendar Consulta

```bash
curl -X POST http://localhost:3000/tools/agendar_consulta \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "11111111-1111-1111-1111-111111111111",
    "slot": "2025-11-10T14:00:00-03:00"
  }'
```

**Resposta esperada:**

```json
{
  "ok": true,
  "data": {
    "meeting_url": "https://meet.google.com/abc-defg-hij"
  }
}
```

### 5.5 Emitir Cobrança

```bash
curl -X POST http://localhost:3000/tools/emitir_cobranca \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "11111111-1111-1111-1111-111111111111",
    "valor": 350.00,
    "descricao": "Consulta inicial"
  }'
```

**Resposta esperada:**

```json
{
  "ok": true,
  "data": {
    "payment_url": "https://pay.mock.example.com/xyz123"
  }
}
```

## 6. Testes de Validação (Devem Falhar)

### 6.1 NUP Inválido

```bash
curl -X POST http://localhost:3000/tools/consulta_datajud \
  -H "Content-Type: application/json" \
  -d '{"nup": "123456-invalid"}'
```

**Resposta esperada:** HTTP 400

```json
{
  "ok": false,
  "error": "NUP inválido",
  "code": "VALIDATION_ERROR"
}
```

### 6.2 Telefone Inválido

```bash
curl -X POST http://localhost:3000/tools/buscar_cliente_por_whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone": "123"}'
```

**Resposta esperada:** HTTP 400

```json
{
  "ok": false,
  "error": "Número de telefone inválido",
  "code": "VALIDATION_ERROR"
}
```

## 7. Testar Jobs (Manualmente via Redis)

### 7.1 Enfileirar Job de Verificação DJEN

```bash
# Instalar Redis CLI se necessário: npm install -g redis-cli

redis-cli LPUSH bull:check-djen:waiting '{
  "data": {},
  "opts": {
    "jobId": "manual-test-djen",
    "timestamp": ' $(date +%s)000 '
  }
}'
```

### 7.2 Enfileirar Job de Verificação DataJud

```bash
redis-cli LPUSH bull:check-datajud:waiting '{
  "data": {},
  "opts": {
    "jobId": "manual-test-datajud",
    "timestamp": ' $(date +%s)000 '
  }
}'
```

### 7.3 Verificar Status das Filas

```bash
redis-cli LLEN bull:check-djen:waiting
redis-cli LLEN bull:check-datajud:waiting
redis-cli LLEN bull:send-notification:waiting
```

## 8. Ciclo Completo (End-to-End)

### Preparação

```bash
# 1. Limpar notificações antigas
psql $DATABASE_URL -c "DELETE FROM notifications WHERE tipo = 'nova_datajud';"

# 2. Remover último evento para forçar detecção de "novo"
psql $DATABASE_URL -c "DELETE FROM events WHERE case_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND codigo = 'SENTENCA';"
```

### Executar Ciclo

```bash
# 1. Enfileirar job de verificação (simula job diário)
curl -X POST http://localhost:3000/tools/consulta_datajud \
  -H "Content-Type: application/json" \
  -d '{"nup": "0001234-56.2024.8.24.0001"}'

# 2. Aguardar processamento dos workers (5-10 segundos)
sleep 10

# 3. Verificar se notificação foi criada
psql $DATABASE_URL -c "SELECT * FROM notifications ORDER BY sent_at DESC LIMIT 1;"
```

**Resultado esperado:**

```
             id              |              case_id              |     tipo      |  chave_unica  |          sent_at
-----------------------------+-----------------------------------+---------------+---------------+----------------------------
 n-uuid-xxx                  | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa | nova_datajud  | hash123       | 2025-01-06 10:30:00
```

## 9. Monitoramento em Tempo Real

### Logs

```bash
# Seguir logs do servidor
npm run dev

# Em outro terminal, enviar requisições e observar logs
curl -X POST http://localhost:3000/webhooks/whatsapp ...
```

### Banco de Dados

```bash
# Monitorar novos eventos
watch -n 2 'psql $DATABASE_URL -c "SELECT id, codigo, titulo, data_evento FROM events ORDER BY created_at DESC LIMIT 5;"'

# Monitorar notificações
watch -n 2 'psql $DATABASE_URL -c "SELECT id, tipo, sent_at FROM notifications ORDER BY sent_at DESC LIMIT 5;"'
```

### Redis

```bash
# Monitorar filas
watch -n 2 'redis-cli LLEN bull:send-notification:waiting'
```

## 10. Testes de Carga (Opcional)

### Rate Limiting

```bash
# Enviar 150 requisições em 60 segundos (deve ultrapassar limite de 100/min)
for i in {1..150}; do
  curl http://localhost:3000/healthz &
  sleep 0.4
done
wait
```

**Resultado esperado:** Após ~100 requisições, começar a receber HTTP 429 (Rate Limit Exceeded).

## Troubleshooting

### Problema: Webhook não recebe mensagens

1. Verificar se servidor está acessível publicamente (use ngrok para testes)
2. Confirmar que `WHATSAPP_VERIFY_TOKEN` está correto
3. Checar logs do servidor para erros de validação

### Problema: Jobs não processam

1. Verificar se Redis está rodando: `redis-cli ping`
2. Confirmar que `ENABLE_WORKERS=true` está definido
3. Checar logs dos workers

### Problema: Notificações duplicadas

1. Verificar tabela `notifications` para chaves únicas duplicadas:
   ```bash
   psql $DATABASE_URL -c "SELECT chave_unica, COUNT(*) FROM notifications GROUP BY chave_unica HAVING COUNT(*) > 1;"
   ```
2. Se houver duplicatas, há um bug na geração de `chaveUnica`

## Conclusão

Após executar todos os testes, o sistema deve:

- Responder a health checks
- Validar webhook do WhatsApp
- Processar mensagens e responder adequadamente
- Consultar APIs (mock) de DataJud e DJEN
- Enfileirar e processar jobs
- Enviar notificações sem duplicação
- Aplicar rate limiting
- Logar todos os eventos com estrutura correta
