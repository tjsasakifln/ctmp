import { nanoid } from 'nanoid';
import type { Logger } from '../../config/logger.js';
import type { CalendarProvider, CalendarEventRequest, CalendarEventResponse } from './index.js';

export class MockCalendarProvider implements CalendarProvider {
  constructor(private logger?: Logger) {}

  async criarEvento(request: CalendarEventRequest): Promise<CalendarEventResponse> {
    this.logger?.info({ request, provider: 'mock' }, 'Criando evento no calendário (mock)');

    // Simula latência
    await new Promise((resolve) => setTimeout(resolve, 400));

    const eventId = nanoid();
    const meetingUrl = `https://meet.google.com/${nanoid(10)}`;

    this.logger?.info({ eventId, meetingUrl }, 'Evento criado (mock)');

    return {
      eventId,
      meetingUrl,
    };
  }
}
