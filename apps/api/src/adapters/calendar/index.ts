import type { Logger } from '../../config/logger.js';

export interface CalendarEventRequest {
  clienteId: string;
  slot: Date;
  title?: string;
  description?: string;
}

export interface CalendarEventResponse {
  eventId: string;
  meetingUrl: string;
}

export interface CalendarProvider {
  criarEvento(request: CalendarEventRequest): Promise<CalendarEventResponse>;
}

export async function createCalendarProvider(
  type: 'mock' | 'http',
  logger?: Logger
): Promise<CalendarProvider> {
  if (type === 'mock') {
    const { MockCalendarProvider } = await import('./mock-provider.js');
    return new MockCalendarProvider(logger);
  } else {
    const { HttpCalendarProvider } = await import('./http-provider.js');
    return new HttpCalendarProvider(logger);
  }
}
