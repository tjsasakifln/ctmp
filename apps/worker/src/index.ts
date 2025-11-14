import { logger } from '../../api/src/config/logger.js';

// Import all workers
import '../../api/src/jobs/check-djen-worker.js';
import '../../api/src/jobs/check-datajud-worker.js';
import '../../api/src/jobs/send-notification-worker.js';

logger.info('Worker service started - processing background jobs');

// Graceful shutdown
const shutdown = async () => {
  logger.info('Worker service shutting down...');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Keep the process alive
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception in worker');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection in worker');
  process.exit(1);
});
