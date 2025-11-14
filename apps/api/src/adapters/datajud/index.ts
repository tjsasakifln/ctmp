import type { Logger } from '../../config/logger.js';
import type { DataJudMovement } from '../../types/index.js';

export interface DataJudProvider {
  consultarMovimentacoes(nup: string): Promise<DataJudMovement[]>;
}

export interface DataJudResponse {
  ok: boolean;
  movements: DataJudMovement[];
  last_seen?: string;
}

export async function createDataJudProvider(
  type: 'mock' | 'http',
  logger?: Logger
): Promise<DataJudProvider> {
  if (type === 'mock') {
    const { MockDataJudProvider } = await import('./mock-provider.js');
    return new MockDataJudProvider(logger);
  } else {
    const { HttpDataJudProvider } = await import('./http-provider.js');
    return new HttpDataJudProvider(logger);
  }
}
