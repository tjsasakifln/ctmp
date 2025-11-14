import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { notifications } from '../../config/schema.js';

export async function notificationExists(chaveUnica: string): Promise<boolean> {
  const result = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(eq(notifications.chaveUnica, chaveUnica))
    .limit(1);

  return result.length > 0;
}

export async function createNotification(data: {
  caseId?: string;
  tipo: string;
  chaveUnica: string;
  payload?: unknown;
}): Promise<void> {
  await db.insert(notifications).values({
    caseId: data.caseId || null,
    tipo: data.tipo,
    chaveUnica: data.chaveUnica,
    payload: data.payload || null,
  });
}
