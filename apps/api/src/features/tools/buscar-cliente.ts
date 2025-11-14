import type { Logger } from '../../config/logger.js';
import { findClientByPhone } from '../clients/repository.js';
import { findCasesByClientId } from '../cases/repository.js';
import type { ApiResponse } from '../../types/index.js';

interface ClienteResponse {
  id: string;
  nome: string | null;
  nup?: string;
}

export async function buscarClientePorWhatsApp(
  phone: string,
  logger?: Logger
): Promise<ApiResponse<{ cliente: ClienteResponse | null }>> {
  try {
    const client = await findClientByPhone(phone);

    if (!client) {
      return {
        ok: true,
        data: { cliente: null },
      };
    }

    // Busca cases do cliente
    const cases = await findCasesByClientId(client.id);

    return {
      ok: true,
      data: {
        cliente: {
          id: client.id,
          nome: client.nome,
          nup: cases[0]?.nup, // Retorna o primeiro NUP, se houver
        },
      },
    };
  } catch (error) {
    logger?.error({ error, phone }, 'Erro ao buscar cliente por WhatsApp');
    return {
      ok: false,
      error: 'Erro ao buscar cliente',
    };
  }
}
