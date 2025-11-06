import { pgTable, uuid, varchar, timestamp, text, pgEnum, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';

// Enum para origem dos eventos
export const eventOriginEnum = pgEnum('event_origin', ['datajud', 'djen']);

// Tabela: clients
export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  phoneE164: varchar('phone_e164', { length: 20 }).notNull().unique(),
  nome: varchar('nome', { length: 255 }),
  cpf: varchar('cpf', { length: 14 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    phoneIdx: uniqueIndex('clients_phone_idx').on(table.phoneE164),
  };
});

// Tabela: cases (processos)
export const cases = pgTable('cases', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  nup: varchar('nup', { length: 50 }).notNull().unique(),
  tribunal: varchar('tribunal', { length: 50 }),
  etiqueta: varchar('etiqueta', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    nupIdx: uniqueIndex('cases_nup_idx').on(table.nup),
    clientIdIdx: index('cases_client_id_idx').on(table.clientId),
  };
});

// Tabela: events
export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  caseId: uuid('case_id').references(() => cases.id, { onDelete: 'cascade' }).notNull(),
  origem: eventOriginEnum('origem').notNull(),
  codigo: varchar('codigo', { length: 100 }).notNull(),
  titulo: varchar('titulo', { length: 500 }).notNull(),
  descricao: text('descricao'),
  dataEvento: timestamp('data_evento').notNull(),
  raw: jsonb('raw'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    caseIdIdx: index('events_case_id_idx').on(table.caseId),
    dataEventoIdx: index('events_data_evento_idx').on(table.dataEvento),
    compositeIdx: index('events_case_origem_data_idx').on(table.caseId, table.origem, table.dataEvento),
  };
});

// Tabela: notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  caseId: uuid('case_id').references(() => cases.id, { onDelete: 'cascade' }),
  tipo: varchar('tipo', { length: 100 }).notNull(),
  chaveUnica: varchar('chave_unica', { length: 255 }).notNull().unique(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  payload: jsonb('payload'),
}, (table) => {
  return {
    chaveUnicaIdx: uniqueIndex('notifications_chave_unica_idx').on(table.chaveUnica),
    caseIdIdx: index('notifications_case_id_idx').on(table.caseId),
  };
});

// Tabela: system_state (key-value store)
export const systemState = pgTable('system_state', {
  key: varchar('key', { length: 255 }).primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
