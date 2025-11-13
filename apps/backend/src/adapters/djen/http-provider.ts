import { env } from '../../config/env.js';
import { ExternalServiceError } from '../../utils/errors.js';
import type { Logger } from '../../config/logger.js';
import type { DJENProvider, DJENQueryParams } from './index.js';
import type { DJENPublicacao } from '../../types/index.js';

export class HttpDJENProvider implements DJENProvider {
  constructor(private logger?: Logger) {}

  async consultarPublicacoes(params: DJENQueryParams): Promise<DJENPublicacao[]> {
    if (!env.DJEN_API_URL || !env.DJEN_API_KEY) {
      throw new ExternalServiceError('DJEN', {
        error: 'DJEN_API_URL and DJEN_API_KEY must be set',
      });
    }

    this.logger?.info({ params, provider: 'http' }, 'Consultando publicações DJEN (HTTP)');

    try {
      const queryParams = new URLSearchParams({
        tribunal: params.tribunal,
        data_inicio: params.dataInicio,
        data_fim: params.dataFim,
        ...(params.nup && { nup: params.nup }),
      });

      const url = `${env.DJEN_API_URL}/publicacoes?${queryParams}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${env.DJEN_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ExternalServiceError('DJEN', {
          status: response.status,
          statusText: response.statusText,
        });
      }

      const data = await response.json();
      return this.normalizeResponse(data);
    } catch (error) {
      this.logger?.error({ error, params }, 'Erro ao consultar DJEN');
      throw error;
    }
  }

  private normalizeResponse(data: unknown): DJENPublicacao[] {
    if (
      !data ||
      typeof data !== 'object' ||
      !('publicacoes' in data) ||
      !Array.isArray(data.publicacoes)
    ) {
      return [];
    }

    return data.publicacoes.map((pub: unknown) => {
      // Type guard for API response structure
      const pubObj = pub as Record<string, unknown>;
      return {
        codigo: String(pubObj.codigo || pubObj.id || ''),
        titulo: String(pubObj.titulo || pubObj.assunto || ''),
        descricao: String(pubObj.texto || pubObj.conteudo || ''),
        data_evento: String(pubObj.data_publicacao || pubObj.dataPublicacao || ''),
        origem: 'djen' as const,
      };
    });
  }
}
