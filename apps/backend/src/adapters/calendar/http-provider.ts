import { env } from '../../config/env.js';
import { ExternalServiceError } from '../../utils/errors.js';
import type { Logger } from '../../config/logger.js';
import type { CalendarProvider, CalendarEventRequest, CalendarEventResponse } from './index.js';

export class HttpCalendarProvider implements CalendarProvider {
  constructor(private logger?: Logger) {}

  async criarEvento(request: CalendarEventRequest): Promise<CalendarEventResponse> {
    if (!env.GOOGLE_CALENDAR_CREDENTIALS) {
      throw new ExternalServiceError('Calendar', {
        error: 'GOOGLE_CALENDAR_CREDENTIALS must be set',
      });
    }

    this.logger?.info({ request, provider: 'http' }, 'Criando evento no calendário (HTTP)');

    try {
      // TODO: Implementar integração real com Google Calendar API
      // Requer OAuth2, service account, ou API key
      // Por ora, lança erro indicando necessidade de implementação

      throw new ExternalServiceError('Calendar', {
        error: 'Google Calendar integration not yet implemented',
      });
    } catch (error) {
      this.logger?.error({ error, request }, 'Erro ao criar evento no calendário');
      throw error;
    }
  }
}
