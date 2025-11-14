import type { Logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import { createPaymentsProvider } from '../../adapters/payments/index.js';
import { getClientById } from '../clients/repository.js';
import type { ApiResponse } from '../../types/index.js';

interface CobrancaRequest {
  clienteId: string;
  valor: number;
  descricao: string;
}

export async function emitirCobranca(
  request: CobrancaRequest,
  logger?: Logger
): Promise<ApiResponse<{ payment_url: string }>> {
  try {
    const client = await getClientById(request.clienteId);

    if (!client) {
      return {
        ok: false,
        error: 'Cliente não encontrado',
      };
    }

    const provider = await createPaymentsProvider(env.PAYMENTS_PROVIDER, logger);

    const payment = await provider.criarCobranca({
      clienteId: request.clienteId,
      valor: request.valor,
      descricao: request.descricao,
    });

    return {
      ok: true,
      data: {
        payment_url: payment.paymentUrl,
      },
    };
  } catch (error) {
    logger?.error({ error, request }, 'Erro ao emitir cobrança');
    return {
      ok: false,
      error: 'Erro ao emitir cobrança',
    };
  }
}
