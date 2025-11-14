import type { Logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import {
  createDJENProvider,
  type DJENResponse,
  type DJENQueryParams,
} from '../../adapters/djen/index.js';

export async function consultaDJEN(
  params: DJENQueryParams,
  logger?: Logger
): Promise<DJENResponse> {
  const provider = await createDJENProvider(env.DJEN_PROVIDER, logger);

  try {
    const publicacoes = await provider.consultarPublicacoes(params);

    // Ordena por data (mais recente primeiro)
    const sortedPublicacoes = publicacoes.sort(
      (a, b) => new Date(b.data_evento).getTime() - new Date(a.data_evento).getTime()
    );

    return {
      ok: true,
      publicacoes: sortedPublicacoes,
    };
  } catch (error) {
    logger?.error({ error, params }, 'Erro ao consultar DJEN');
    return {
      ok: false,
      publicacoes: [],
    };
  }
}
