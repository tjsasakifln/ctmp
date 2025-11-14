import { logger } from '../../api/src/config/logger.js';

// Import scheduler
import '../../api/src/jobs/scheduler.js';

logger.info('Scheduler service started - managing cron jobs');

// Graceful shutdown
const shutdown = async () => {
  logger.info('Scheduler service shutting down...');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Keep the process alive
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception in scheduler');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection in scheduler');
  process.exit(1);
});
