// Arquivo para inicializar todos os workers e scheduler

import './check-djen-worker.js';
import './check-datajud-worker.js';
import './send-notification-worker.js';
import './scheduler.js';

import { logger } from '../config/logger.js';

logger.info('Todos os workers e scheduler inicializados');
