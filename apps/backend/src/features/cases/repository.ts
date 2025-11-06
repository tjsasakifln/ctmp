import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { cases, events } from '../../config/schema.js';
import type { Case, Event, EventOrigin } from '../../types/index.js';

export async function findCaseByNUP(nup: string): Promise<Case | null> {
  const result = await db.select().from(cases).where(eq(cases.nup, nup)).limit(1);

  return result[0] || null;
}

export async function findCasesByClientId(clientId: string): Promise<Case[]> {
  return db.select().from(cases).where(eq(cases.clientId, clientId));
}

export async function createCase(data: {
  clientId: string;
  nup: string;
  tribunal?: string;
  etiqueta?: string;
}): Promise<Case> {
  const result = await db
    .insert(cases)
    .values({
      clientId: data.clientId,
      nup: data.nup,
      tribunal: data.tribunal || null,
      etiqueta: data.etiqueta || null,
    })
    .returning();

  return result[0];
}

export async function getCaseById(caseId: string): Promise<Case | null> {
  const result = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);

  return result[0] || null;
}

export async function getLatestEventForCase(
  caseId: string,
  origem?: EventOrigin
): Promise<Event | null> {
  const conditions = origem
    ? and(eq(events.caseId, caseId), eq(events.origem, origem))
    : eq(events.caseId, caseId);

  const result = await db
    .select()
    .from(events)
    .where(conditions)
    .orderBy(desc(events.dataEvento))
    .limit(1);

  return result[0] || null;
}

export async function getEventsByCaseId(
  caseId: string,
  limit: number = 10
): Promise<Event[]> {
  return db
    .select()
    .from(events)
    .where(eq(events.caseId, caseId))
    .orderBy(desc(events.dataEvento))
    .limit(limit);
}

export async function createEvent(data: {
  caseId: string;
  origem: EventOrigin;
  codigo: string;
  titulo: string;
  descricao?: string;
  dataEvento: Date;
  raw?: unknown;
}): Promise<Event> {
  const result = await db
    .insert(events)
    .values({
      caseId: data.caseId,
      origem: data.origem,
      codigo: data.codigo,
      titulo: data.titulo,
      descricao: data.descricao || null,
      dataEvento: data.dataEvento,
      raw: data.raw || null,
    })
    .returning();

  return result[0];
}

export async function getAllActiveCases(): Promise<Case[]> {
  // Por enquanto, todos os cases são considerados ativos
  // TODO: adicionar flag is_active ao schema se necessário
  return db.select().from(cases);
}
