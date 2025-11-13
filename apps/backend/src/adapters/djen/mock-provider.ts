import type { Logger } from '../../config/logger.js';
import type { DJENProvider, DJENQueryParams } from './index.js';
import type { DJENPublicacao } from '../../types/index.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class MockDJENProvider implements DJENProvider {
  constructor(private logger?: Logger) {}

  async consultarPublicacoes(params: DJENQueryParams): Promise<DJENPublicacao[]> {
    this.logger?.info({ params, provider: 'mock' }, 'Consultando publicações DJEN (mock)');

    // Simula latência
    await new Promise((resolve) => setTimeout(resolve, 700));

    try {
      const fixturesPath = join(__dirname, 'fixtures', 'publicacoes.json');
      const data = await readFile(fixturesPath, 'utf-8');
      const fixtures = JSON.parse(data);

      // Filtra por tribunal
      const publicacoes = fixtures[params.tribunal] || fixtures['DEFAULT'];

      // Se NUP especificado, filtra
      if (params.nup && Array.isArray(publicacoes)) {
        return publicacoes.filter((p: DJENPublicacao) =>
          p.descricao?.includes(params.nup) || p.titulo?.includes(params.nup)
        );
      }

      return publicacoes || [];
    } catch (error) {
      this.logger?.warn({ error }, 'Erro ao carregar fixtures DJEN, usando dados padrão');

      return [
        {
          codigo: 'DJEN-001',
          titulo: 'Publicação de despacho',
          descricao: `Despacho publicado no Diário Judicial Eletrônico do ${params.tribunal}.`,
          data_evento: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          origem: 'djen' as const,
        },
      ];
    }
  }
}
