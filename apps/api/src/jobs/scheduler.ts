import { CronJob } from 'cron';
import { logger } from '../config/logger.js';
import { checkDJENQueue, checkDataJudQueue } from '../config/queues.js';

// Job diário às 08:00 (horário de Brasília UTC-3)
const dailyCheckJob = new CronJob(
  '0 8 * * *', // Cron: 08:00 todos os dias
  async () => {
    logger.info('Iniciando verificação diária de processos');

    try {
      // Enfileira jobs de verificação
      await checkDJENQueue.add(
        'daily-check',
        {},
        {
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      await checkDataJudQueue.add(
        'daily-check',
        {},
        {
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      logger.info('Jobs de verificação diária enfileirados');
    } catch (error) {
      logger.error({ error }, 'Erro ao enfileirar jobs de verificação diária');
    }
  },
  null,
  true,
  'America/Sao_Paulo'
);

logger.info('Scheduler de verificação diária iniciado (08:00 BRT)');

// Graceful shutdown
process.on('SIGINT', () => {
  dailyCheckJob.stop();
  logger.info('Scheduler parado');
});

process.on('SIGTERM', () => {
  dailyCheckJob.stop();
  logger.info('Scheduler parado');
});

export { dailyCheckJob };
