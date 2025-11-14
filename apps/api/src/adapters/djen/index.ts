import type { Logger } from '../../config/logger.js';
import type { DJENPublicacao } from '../../types/index.js';

export interface DJENQueryParams {
  tribunal: string;
  dataInicio: string;
  dataFim: string;
  nup?: string;
}

export interface DJENProvider {
  consultarPublicacoes(params: DJENQueryParams): Promise<DJENPublicacao[]>;
}

export interface DJENResponse {
  ok: boolean;
  publicacoes: DJENPublicacao[];
}

export async function createDJENProvider(
  type: 'mock' | 'http',
  logger?: Logger
): Promise<DJENProvider> {
  if (type === 'mock') {
    const { MockDJENProvider } = await import('./mock-provider.js');
    return new MockDJENProvider(logger);
  } else {
    const { HttpDJENProvider } = await import('./http-provider.js');
    return new HttpDJENProvider(logger);
  }
}
