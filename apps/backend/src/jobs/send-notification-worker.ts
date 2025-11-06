import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { getCaseById } from '../features/cases/repository.js';
import { getClientById } from '../features/clients/repository.js';
import { notificationExists, createNotification } from '../features/notifications/repository.js';
import { sendTextMessage } from '../adapters/whatsapp/client.js';
import { formatLegalEventForUser } from '../core/legal-translator.js';

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

interface SendNotificationJobData {
  caseId: string;
  nup: string;
  event: {
    codigo: string;
    titulo: string;
    descricao: string;
    data_evento: string;
    origem: 'datajud' | 'djen';
  };
  chaveUnica: string;
}

async function processSendNotification(job: Job<SendNotificationJobData>): Promise<void> {
  const log = logger.child({ jobId: job.id, queue: 'send-notification' });
  log.info({ caseId: job.data.caseId, chaveUnica: job.data.chaveUnica }, 'Processando notificação');

  try {
    // Verifica idempotência
    const exists = await notificationExists(job.data.chaveUnica);
    if (exists) {
      log.info({ chaveUnica: job.data.chaveUnica }, 'Notificação já enviada, pulando');
      return;
    }

    // Busca case e cliente
    const activeCase = await getCaseById(job.data.caseId);
    if (!activeCase) {
      log.warn({ caseId: job.data.caseId }, 'Case não encontrado');
      return;
    }

    const client = await getClientById(activeCase.clientId);
    if (!client) {
      log.warn({ clientId: activeCase.clientId }, 'Cliente não encontrado');
      return;
    }

    // Formata mensagem
    const mensagemEvento = formatLegalEventForUser(job.data.event);
    const tipoOrigem = job.data.event.origem === 'datajud' ? 'Movimentação' : 'Publicação';

    const mensagem =
      `🔔 *Nova ${tipoOrigem} no seu processo*\n\n` +
      `Processo: *${job.data.nup}*\n\n` +
      mensagemEvento +
      `\n\n_Você pode me enviar uma mensagem a qualquer momento para consultar o andamento._`;

    // Envia notificação
    await sendTextMessage(client.phoneE164, mensagem, log);

    // Salva notificação
    await createNotification({
      caseId: job.data.caseId,
      tipo: `nova_${job.data.event.origem}`,
      chaveUnica: job.data.chaveUnica,
      payload: job.data,
    });

    log.info({ chaveUnica: job.data.chaveUnica }, 'Notificação enviada com sucesso');
  } catch (error) {
    log.error({ error, jobData: job.data }, 'Erro ao enviar notificação');
    throw error;
  }
}

export const sendNotificationWorker = new Worker('send-notification', processSendNotification, {
  connection,
  concurrency: 10,
});

sendNotificationWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Job send-notification concluído');
});

sendNotificationWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err }, 'Job send-notification falhou');
});

logger.info('Worker send-notification iniciado');
