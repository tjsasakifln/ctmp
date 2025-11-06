import { env } from '../../config/env.js';
import { ExternalServiceError } from '../../utils/errors.js';
import type { Logger } from '../../config/logger.js';
import type { DataJudProvider } from './index.js';
import type { DataJudMovement } from '../../types/index.js';

export class HttpDataJudProvider implements DataJudProvider {
  constructor(private logger?: Logger) {}

  async consultarMovimentacoes(nup: string): Promise<DataJudMovement[]> {
    if (!env.DATAJUD_API_URL || !env.DATAJUD_API_KEY) {
      throw new ExternalServiceError('DataJud', {
        error: 'DATAJUD_API_URL and DATAJUD_API_KEY must be set',
      });
    }

    this.logger?.info({ nup, provider: 'http' }, 'Consultando movimentações DataJud (HTTP)');

    try {
      const url = `${env.DATAJUD_API_URL}/processos/${encodeURIComponent(nup)}/movimentacoes`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${env.DATAJUD_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ExternalServiceError('DataJud', {
          status: response.status,
          statusText: response.statusText,
        });
      }

      const data = await response.json();

      // Normalizar resposta da API real para formato interno
      return this.normalizeResponse(data);
    } catch (error) {
      this.logger?.error({ error, nup }, 'Erro ao consultar DataJud');
      throw error;
    }
  }

  private normalizeResponse(data: any): DataJudMovement[] {
    // TODO: Adaptar conforme estrutura real da API DataJud
    if (!Array.isArray(data.movimentacoes)) {
      return [];
    }

    return data.movimentacoes.map((mov: any) => ({
      codigo: mov.codigo || mov.codigoMovimento,
      titulo: mov.titulo || mov.descricao,
      descricao: mov.complemento || mov.observacao || '',
      data_evento: mov.dataHora || mov.dataMovimento,
      origem: 'datajud' as const,
    }));
  }
}
