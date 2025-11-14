import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

// Configuração do Redis
const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Filas
export const checkDJENQueue = new Queue('check-djen', { connection });
export const checkDataJudQueue = new Queue('check-datajud', { connection });
export const sendNotificationQueue = new Queue('send-notification', { connection });

logger.info('BullMQ queues initialized');

// Graceful shutdown
const queues = [checkDJENQueue, checkDataJudQueue, sendNotificationQueue];

process.on('SIGINT', async () => {
  logger.info('Closing BullMQ queues...');
  await Promise.all(queues.map((q) => q.close()));
  await connection.quit();
  logger.info('BullMQ queues closed');
});

process.on('SIGTERM', async () => {
  logger.info('Closing BullMQ queues...');
  await Promise.all(queues.map((q) => q.close()));
  await connection.quit();
  logger.info('BullMQ queues closed');
});
