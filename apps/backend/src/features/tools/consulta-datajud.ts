import type { Logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import { createDataJudProvider, type DataJudResponse } from '../../adapters/datajud/index.js';

export async function consultaDataJud(nup: string, logger?: Logger): Promise<DataJudResponse> {
  const provider = await createDataJudProvider(env.DATAJUD_PROVIDER, logger);

  try {
    const movements = await provider.consultarMovimentacoes(nup);

    // Ordena por data (mais recente primeiro)
    const sortedMovements = movements.sort(
      (a, b) => new Date(b.data_evento).getTime() - new Date(a.data_evento).getTime()
    );

    const lastSeen = sortedMovements[0]?.data_evento;

    return {
      ok: true,
      movements: sortedMovements,
      last_seen: lastSeen,
    };
  } catch (error) {
    logger?.error({ error, nup }, 'Erro ao consultar DataJud');
    return {
      ok: false,
      movements: [],
    };
  }
}
