import type { Logger } from '../../config/logger.js';

export interface PaymentRequest {
  clienteId: string;
  valor: number;
  descricao: string;
}

export interface PaymentResponse {
  paymentUrl: string;
  paymentId: string;
}

export interface PaymentsProvider {
  criarCobranca(request: PaymentRequest): Promise<PaymentResponse>;
}

export async function createPaymentsProvider(
  type: 'mock' | 'http',
  logger?: Logger
): Promise<PaymentsProvider> {
  if (type === 'mock') {
    const { MockPaymentsProvider } = await import('./mock-provider.js');
    return new MockPaymentsProvider(logger);
  } else {
    const { HttpPaymentsProvider } = await import('./http-provider.js');
    return new HttpPaymentsProvider(logger);
  }
}
