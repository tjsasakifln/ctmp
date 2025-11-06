import { env } from '../../config/env.js';
import { ExternalServiceError } from '../../utils/errors.js';
import type { Logger } from '../../config/logger.js';
import type { PaymentsProvider, PaymentRequest, PaymentResponse } from './index.js';

export class HttpPaymentsProvider implements PaymentsProvider {
  constructor(private logger?: Logger) {}

  async criarCobranca(request: PaymentRequest): Promise<PaymentResponse> {
    if (!env.PAYMENTS_API_URL || !env.PAYMENTS_API_KEY) {
      throw new ExternalServiceError('Payments', {
        error: 'PAYMENTS_API_URL and PAYMENTS_API_KEY must be set',
      });
    }

    this.logger?.info({ request, provider: 'http' }, 'Criando cobrança (HTTP)');

    try {
      const url = `${env.PAYMENTS_API_URL}/charges`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.PAYMENTS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: request.clienteId,
          amount: request.valor,
          description: request.descricao,
        }),
      });

      if (!response.ok) {
        throw new ExternalServiceError('Payments', {
          status: response.status,
          statusText: response.statusText,
        });
      }

      const data = await response.json();

      return {
        paymentId: data.id || data.payment_id,
        paymentUrl: data.payment_url || data.url,
      };
    } catch (error) {
      this.logger?.error({ error, request }, 'Erro ao criar cobrança');
      throw error;
    }
  }
}
