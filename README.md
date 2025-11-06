# CTMP - Sistema de Atendimento Jurídico por WhatsApp

MVP de sistema de atendimento jurídico automatizado via WhatsApp com consulta oficial ao andamento processual (DataJud/DJEN) e agendamento pago.

## Stack Tecnológica

- **Runtime:** Node.js 20+
- **Framework:** Fastify
- **Database:** PostgreSQL (Supabase)
- **ORM:** Drizzle ORM
- **Jobs:** BullMQ + Redis
- **WhatsApp:** WhatsApp Business Cloud API
- **TypeScript:** Tipagem rigorosa com Zod

## Início Rápido

Veja [QUICKSTART.md](QUICKSTART.md) para instruções de instalação em 5 minutos.

## Estrutura

```
├── apps/backend/        # Aplicação principal
│   ├── src/             # Código-fonte TypeScript
│   ├── test/            # Testes unitários e integração
│   └── README.md        # Documentação completa do backend
├── scripts/             # Scripts de desenvolvimento e seed
└── QUICKSTART.md        # Guia rápido de instalação
```

## Funcionalidades

### Atendimento Automatizado
- Recepção de mensagens via WhatsApp Cloud API
- Identificação automática de clientes
- Consulta de andamento processual (DataJud/DJEN)
- Respostas em português simples (tradutor de juridiquês)

### Ferramentas HTTP (para Agent Builder)
- `POST /tools/consulta_datajud` - Consulta movimentações processuais
- `POST /tools/consulta_djen` - Consulta publicações do Diário Eletrônico
- `POST /tools/buscar_cliente_por_whatsapp` - Busca cliente por telefone
- `POST /tools/agendar_consulta` - Agenda consulta jurídica
- `POST /tools/emitir_cobranca` - Gera link de pagamento

### Notificações Automáticas
- Job diário (08:00 BRT) verifica novos eventos
- Notifica clientes via WhatsApp sobre atualizações
- Idempotência garantida (sem duplicatas)

## Instalação

```bash
# 1. Instalar dependências
cd apps/backend
npm install

# 2. Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 3. Subir serviços
docker-compose up -d postgres redis

# 4. Rodar migrações
npm run db:migrate
npm run db:seed

# 5. Iniciar
npm run dev
```

## Documentação

- [Backend README](apps/backend/README.md) - Documentação técnica completa
- [TESTING.md](apps/backend/TESTING.md) - Guia de testes manuais
- [QUICKSTART.md](QUICKSTART.md) - Instalação rápida

## Segurança e Confiabilidade

- Logs estruturados com rastreamento completo (request_id, client_id, case_id)
- Rate limiting (100 req/min)
- Retry exponencial em integrações externas
- Validação rigorosa com Zod
- Tradutor determinístico (sem alucinação de IA)

## Licença

MIT

## Suporte

Para problemas ou dúvidas, abra uma issue no repositório.
