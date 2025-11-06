-- Seed data para desenvolvimento e testes

-- Limpar dados existentes (cuidado em produção!)
TRUNCATE TABLE notifications, events, cases, clients, system_state CASCADE;

-- Inserir clientes de teste
INSERT INTO clients (id, phone_e164, nome, cpf, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', '+5548999990001', 'João Silva', '12345678901', NOW() - INTERVAL '30 days'),
  ('22222222-2222-2222-2222-222222222222', '+5548999990002', 'Maria Santos', '98765432109', NOW() - INTERVAL '15 days'),
  ('33333333-3333-3333-3333-333333333333', '+5548999990003', 'Pedro Oliveira', NULL, NOW() - INTERVAL '5 days');

-- Inserir processos (cases)
INSERT INTO cases (id, client_id, nup, tribunal, etiqueta, created_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '0001234-56.2024.8.24.0001', 'TJSC', 'Ação de Cobrança', NOW() - INTERVAL '25 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '0007890-12.2024.8.24.0023', 'TJSC', 'Ação Trabalhista', NOW() - INTERVAL '10 days');

-- Inserir eventos históricos
INSERT INTO events (id, case_id, origem, codigo, titulo, descricao, data_evento, raw, created_at) VALUES
  (
    'e1111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'datajud',
    'DISTRIBUICAO',
    'Distribuição',
    'Processo distribuído automaticamente.',
    NOW() - INTERVAL '25 days',
    '{"tipo": "distribuicao", "magistrado": "Juiz João"}',
    NOW() - INTERVAL '25 days'
  ),
  (
    'e2222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'datajud',
    'CITACAO',
    'Expedição de mandado de citação',
    'Expedido mandado de citação do réu.',
    NOW() - INTERVAL '20 days',
    '{"tipo": "citacao"}',
    NOW() - INTERVAL '20 days'
  ),
  (
    'e3333333-3333-3333-3333-333333333333',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'djen',
    'DJEN-20251105-001',
    'Publicação de sentença',
    'Publicada sentença de procedência nos autos do processo 0001234-56.2024.8.24.0001.',
    NOW() - INTERVAL '2 days',
    '{"tribunal": "TJSC", "caderno": "1"}',
    NOW() - INTERVAL '2 days'
  ),
  (
    'e4444444-4444-4444-4444-444444444444',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'datajud',
    'JUNTADA',
    'Juntada de petição',
    'Juntada de petição de contestação apresentada pelo réu.',
    NOW() - INTERVAL '5 days',
    '{"tipo": "juntada", "parte": "reu"}',
    NOW() - INTERVAL '5 days'
  );

-- Inserir algumas notificações já enviadas (para testar idempotência)
INSERT INTO notifications (id, case_id, tipo, chave_unica, sent_at, payload) VALUES
  (
    'n1111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'nova_djen',
    'test-key-001',
    NOW() - INTERVAL '2 days',
    '{"event": "DJEN-20251105-001"}'
  );

-- Inserir estado do sistema (exemplo: última execução do job)
INSERT INTO system_state (key, value, updated_at) VALUES
  ('last_djen_check', '{"timestamp": "2025-01-05T08:00:00Z", "status": "success"}', NOW() - INTERVAL '1 day'),
  ('last_datajud_check', '{"timestamp": "2025-01-05T08:00:00Z", "status": "success"}', NOW() - INTERVAL '1 day');

-- Mensagem de sucesso
SELECT 'Seed concluído com sucesso!' as message;
SELECT COUNT(*) as clients_count FROM clients;
SELECT COUNT(*) as cases_count FROM cases;
SELECT COUNT(*) as events_count FROM events;
SELECT COUNT(*) as notifications_count FROM notifications;
