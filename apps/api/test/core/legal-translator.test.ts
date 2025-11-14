import { describe, it, expect } from 'vitest';
import { translateLegalese, formatLegalEventForUser } from '../../src/core/legal-translator';

describe('Legal Translator', () => {
  describe('translateLegalese', () => {
    it('deve traduzir termos jurídicos para português simples', () => {
      expect(translateLegalese('Processo concluso ao magistrado')).toContain('com o juiz para decisão');
      expect(translateLegalese('Juntada de petição')).toContain('anexado');
      expect(translateLegalese('Expedição de mandado')).toContain('foi emitida uma ordem oficial');
    });

    it('deve preservar maiúsculas no início de frases', () => {
      const result = translateLegalese('Concluso para decisão');
      expect(result[0]).toBe('C');
    });

    it('deve retornar texto original se não houver correspondência', () => {
      const texto = 'Texto sem termos jurídicos conhecidos';
      expect(translateLegalese(texto)).toBe(texto);
    });

    it('deve lidar com texto vazio', () => {
      expect(translateLegalese('')).toBe('');
      expect(translateLegalese(null as any)).toBe(null);
    });
  });

  describe('formatLegalEventForUser', () => {
    it('deve formatar evento com data e hora', () => {
      const event = {
        titulo: 'Concluso para decisão',
        descricao: 'Processo concluso ao magistrado',
        data_evento: '2025-01-05T14:30:00Z',
      };

      const result = formatLegalEventForUser(event);

      expect(result).toContain('05/01/2025');
      expect(result).toContain('com o juiz para decisão');
    });

    it('deve omitir descrição se igual ao título', () => {
      const event = {
        titulo: 'Juntada de petição',
        descricao: 'Juntada de petição',
        data_evento: '2025-01-05T14:30:00Z',
      };

      const result = formatLegalEventForUser(event);
      const lines = result.split('\n');

      expect(lines.length).toBeLessThan(5);
    });

    it('deve incluir descrição se diferente do título', () => {
      const event = {
        titulo: 'Juntada',
        descricao: 'Juntada de petição de contestação',
        data_evento: '2025-01-05T14:30:00Z',
      };

      const result = formatLegalEventForUser(event);

      expect(result).toContain('contestação');
    });
  });
});
