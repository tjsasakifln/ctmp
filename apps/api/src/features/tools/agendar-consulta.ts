import type { Logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import { createCalendarProvider } from '../../adapters/calendar/index.js';
import { getClientById } from '../clients/repository.js';
import type { ApiResponse } from '../../types/index.js';

interface AgendamentoRequest {
  clienteId: string;
  slot: Date;
}

export async function agendarConsulta(
  request: AgendamentoRequest,
  logger?: Logger
): Promise<ApiResponse<{ meeting_url: string }>> {
  try {
    const client = await getClientById(request.clienteId);

    if (!client) {
      return {
        ok: false,
        error: 'Cliente não encontrado',
      };
    }

    const provider = await createCalendarProvider(env.CALENDAR_PROVIDER, logger);

    const event = await provider.criarEvento({
      clienteId: request.clienteId,
      slot: request.slot,
      title: `Consulta Jurídica - ${client.nome || 'Cliente'}`,
      description: 'Consulta jurídica agendada via WhatsApp',
    });

    return {
      ok: true,
      data: {
        meeting_url: event.meetingUrl,
      },
    };
  } catch (error) {
    logger?.error({ error, request }, 'Erro ao agendar consulta');
    return {
      ok: false,
      error: 'Erro ao agendar consulta',
    };
  }
}
