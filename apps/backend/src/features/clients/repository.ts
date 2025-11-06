import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { clients } from '../../config/schema.js';
import { normalizePhoneE164 } from '../../utils/validators.js';
import type { Client } from '../../types/index.js';

export async function findClientByPhone(phone: string): Promise<Client | null> {
  const normalizedPhone = normalizePhoneE164(phone);

  const result = await db
    .select()
    .from(clients)
    .where(eq(clients.phoneE164, normalizedPhone))
    .limit(1);

  return result[0] || null;
}

export async function createClient(data: {
  phone: string;
  nome?: string;
  cpf?: string;
}): Promise<Client> {
  const normalizedPhone = normalizePhoneE164(data.phone);

  const result = await db
    .insert(clients)
    .values({
      phoneE164: normalizedPhone,
      nome: data.nome || null,
      cpf: data.cpf || null,
    })
    .returning();

  return result[0];
}

export async function updateClient(
  clientId: string,
  data: Partial<Pick<Client, 'nome' | 'cpf'>>
): Promise<Client> {
  const result = await db
    .update(clients)
    .set(data)
    .where(eq(clients.id, clientId))
    .returning();

  return result[0];
}

export async function getClientById(clientId: string): Promise<Client | null> {
  const result = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);

  return result[0] || null;
}
