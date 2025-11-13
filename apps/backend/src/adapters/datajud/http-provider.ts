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

  private normalizeResponse(data: unknown): DataJudMovement[] {
    // TODO: Adaptar conforme estrutura real da API DataJud
    if (
      !data ||
      typeof data !== 'object' ||
      !('movimentacoes' in data) ||
      !Array.isArray(data.movimentacoes)
    ) {
      return [];
    }

    return data.movimentacoes.map((mov: unknown) => {
      // Type guard for API response structure
      const movObj = mov as Record<string, unknown>;
      return {
        codigo: String(movObj.codigo || movObj.codigoMovimento || ''),
        titulo: String(movObj.titulo || movObj.descricao || ''),
        descricao: String(movObj.complemento || movObj.observacao || ''),
        data_evento: String(movObj.dataHora || movObj.dataMovimento || ''),
        origem: 'datajud' as const,
      };
    });
  }
}
