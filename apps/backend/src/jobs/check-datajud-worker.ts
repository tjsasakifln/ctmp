import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { getAllActiveCases, createEvent, getLatestEventForCase } from '../features/cases/repository.js';
import { consultaDataJud } from '../features/tools/consulta-datajud.js';
import { sendNotificationQueue } from '../config/queues.js';
import { createNotificationKey } from '../utils/validators.js';

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

interface CheckDataJudJobData {
  caseId?: string;
}

async function processCheckDataJud(job: Job<CheckDataJudJobData>): Promise<void> {
  const log = logger.child({ jobId: job.id, queue: 'check-datajud' });
  log.info('Iniciando verificação DataJud');

  try {
    const cases = job.data.caseId
      ? [await import('../features/cases/repository.js').then(m => m.getCaseById(job.data.caseId!))]
      : await getAllActiveCases();

    log.info({ casesCount: cases.length }, 'Cases encontrados para verificação');

    for (const activeCase of cases) {
      if (!activeCase) continue;

      log.info({ caseId: activeCase.id, nup: activeCase.nup }, 'Verificando DataJud para case');

      const result = await consultaDataJud(activeCase.nup, log);

      if (!result.ok || result.movements.length === 0) {
        log.info({ caseId: activeCase.id }, 'Nenhuma movimentação nova encontrada');
        continue;
      }

      const ultimoEvento = await getLatestEventForCase(activeCase.id, 'datajud');
      const ultimaData = ultimoEvento
        ? new Date(ultimoEvento.dataEvento).getTime()
        : 0;

      const eventosNovos = result.movements.filter(
        (mov) => new Date(mov.data_evento).getTime() > ultimaData
      );

      log.info(
        { caseId: activeCase.id, eventosNovos: eventosNovos.length },
        'Novos eventos DataJud encontrados'
      );

      for (const mov of eventosNovos) {
        await createEvent({
          caseId: activeCase.id,
          origem: 'datajud',
          codigo: mov.codigo,
          titulo: mov.titulo,
          descricao: mov.descricao,
          dataEvento: new Date(mov.data_evento),
          raw: mov,
        });

        const chaveUnica = createNotificationKey(
          activeCase.nup,
          'datajud',
          mov.codigo,
          mov.data_evento
        );

        await sendNotificationQueue.add(
          'notify-new-event',
          {
            caseId: activeCase.id,
            nup: activeCase.nup,
            event: mov,
            chaveUnica,
          },
          {
            removeOnComplete: true,
            removeOnFail: false,
          }
        );
      }
    }

    log.info('Verificação DataJud concluída');
  } catch (error) {
    log.error({ error }, 'Erro ao verificar DataJud');
    throw error;
  }
}

export const checkDataJudWorker = new Worker('check-datajud', processCheckDataJud, {
  connection,
  concurrency: 5,
});

checkDataJudWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Job check-datajud concluído');
});

checkDataJudWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err }, 'Job check-datajud falhou');
});

logger.info('Worker check-datajud iniciado');
