import { nanoid } from 'nanoid';
import type { Logger } from '../../config/logger.js';
import type { PaymentsProvider, PaymentRequest, PaymentResponse } from './index.js';

export class MockPaymentsProvider implements PaymentsProvider {
  constructor(private logger?: Logger) {}

  async criarCobranca(request: PaymentRequest): Promise<PaymentResponse> {
    this.logger?.info({ request, provider: 'mock' }, 'Criando cobrança (mock)');

    // Simula latência
    await new Promise((resolve) => setTimeout(resolve, 300));

    const paymentId = nanoid();
    const paymentUrl = `https://pay.mock.example.com/${paymentId}`;

    this.logger?.info({ paymentId, paymentUrl }, 'Cobrança criada (mock)');

    return {
      paymentId,
      paymentUrl,
    };
  }
}
