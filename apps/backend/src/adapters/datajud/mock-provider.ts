import type { Logger } from '../../config/logger.js';
import type { DataJudProvider } from './index.js';
import type { DataJudMovement } from '../../types/index.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class MockDataJudProvider implements DataJudProvider {
  constructor(private logger?: Logger) {}

  async consultarMovimentacoes(nup: string): Promise<DataJudMovement[]> {
    this.logger?.info({ nup, provider: 'mock' }, 'Consultando movimentações DataJud (mock)');

    // Simula latência
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const fixturesPath = join(__dirname, 'fixtures', 'movements.json');
      const data = await readFile(fixturesPath, 'utf-8');
      const fixtures = JSON.parse(data);

      // Retorna movimentações do fixture ou gera dados genéricos
      if (fixtures[nup]) {
        return fixtures[nup];
      }

      // Dados genéricos para qualquer NUP
      return [
        {
          codigo: 'CONCLUSO',
          titulo: 'Concluso para decisão',
          descricao: 'Processo concluso ao(à) magistrado(a) para decisão.',
          data_evento: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          origem: 'datajud' as const,
        },
        {
          codigo: 'JUNTADA',
          titulo: 'Juntada de petição',
          descricao: 'Petição juntada aos autos do processo.',
          data_evento: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          origem: 'datajud' as const,
        },
      ];
    } catch (error) {
      this.logger?.warn({ error }, 'Erro ao carregar fixtures, usando dados padrão');

      return [
        {
          codigo: 'DISTRIBUICAO',
          titulo: 'Distribuição',
          descricao: 'Processo distribuído automaticamente.',
          data_evento: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          origem: 'datajud' as const,
        },
      ];
    }
  }
}
