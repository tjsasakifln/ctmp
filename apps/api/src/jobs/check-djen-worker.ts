import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { getAllActiveCases, createEvent, getLatestEventForCase } from '../features/cases/repository.js';
import { consultaDJEN } from '../features/tools/consulta-djen.js';
import { sendNotificationQueue } from '../config/queues.js';
import { createNotificationKey } from '../utils/validators.js';

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

interface CheckDJENJobData {
  caseId?: string; // Se especificado, checa apenas este case
}

async function processCheckDJEN(job: Job<CheckDJENJobData>): Promise<void> {
  const log = logger.child({ jobId: job.id, queue: 'check-djen' });
  log.info('Iniciando verificação DJEN');

  try {
    // Busca cases para verificar
    const cases = job.data.caseId
      ? [await import('../features/cases/repository.js').then(m => m.getCaseById(job.data.caseId!))]
      : await getAllActiveCases();

    log.info({ casesCount: cases.length }, 'Cases encontrados para verificação');

    // Janela de 7 dias
    const dataFim = new Date();
    const dataInicio = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const activeCase of cases) {
      if (!activeCase) continue;

      log.info({ caseId: activeCase.id, nup: activeCase.nup }, 'Verificando DJEN para case');

      const result = await consultaDJEN(
        {
          tribunal: activeCase.tribunal || 'TJSC',
          dataInicio: dataInicio.toISOString().split('T')[0],
          dataFim: dataFim.toISOString().split('T')[0],
          nup: activeCase.nup,
        },
        log
      );

      if (!result.ok || result.publicacoes.length === 0) {
        log.info({ caseId: activeCase.id }, 'Nenhuma publicação nova encontrada');
        continue;
      }

      // Busca último evento DJEN salvo
      const ultimoEvento = await getLatestEventForCase(activeCase.id, 'djen');
      const ultimaData = ultimoEvento
        ? new Date(ultimoEvento.dataEvento).getTime()
        : 0;

      // Filtra apenas eventos novos
      const eventosNovos = result.publicacoes.filter(
        (pub) => new Date(pub.data_evento).getTime() > ultimaData
      );

      log.info(
        { caseId: activeCase.id, eventosNovos: eventosNovos.length },
        'Novos eventos DJEN encontrados'
      );

      // Salva novos eventos e notifica
      for (const pub of eventosNovos) {
        await createEvent({
          caseId: activeCase.id,
          origem: 'djen',
          codigo: pub.codigo,
          titulo: pub.titulo,
          descricao: pub.descricao,
          dataEvento: new Date(pub.data_evento),
          raw: pub,
        });

        // Enfileira notificação
        const chaveUnica = createNotificationKey(
          activeCase.nup,
          'djen',
          pub.codigo,
          pub.data_evento
        );

        await sendNotificationQueue.add(
          'notify-new-event',
          {
            caseId: activeCase.id,
            nup: activeCase.nup,
            event: pub,
            chaveUnica,
          },
          {
            removeOnComplete: true,
            removeOnFail: false,
          }
        );
      }
    }

    log.info('Verificação DJEN concluída');
  } catch (error) {
    log.error({ error }, 'Erro ao verificar DJEN');
    throw error;
  }
}

export const checkDJENWorker = new Worker('check-djen', processCheckDJEN, {
  connection,
  concurrency: 5,
});

checkDJENWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Job check-djen concluído');
});

checkDJENWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err }, 'Job check-djen falhou');
});

logger.info('Worker check-djen iniciado');
