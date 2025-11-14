import { describe, it, expect } from 'vitest';
import {
  validateNUP,
  normalizePhoneE164,
  validateCPF,
  createNotificationKey,
} from '../../src/utils/validators';

describe('Validators', () => {
  describe('validateNUP', () => {
    it('deve validar NUP válido', () => {
      expect(validateNUP('0001234-56.2024.8.24.0001')).toBe(true);
    });

    it('deve rejeitar NUP com formato inválido', () => {
      expect(validateNUP('123456')).toBe(false);
      expect(validateNUP('0001234-XX.2024.8.24.0001')).toBe(false);
    });

    it('deve rejeitar NUP com tamanho incorreto', () => {
      expect(validateNUP('001234-56.2024.8.24.0001')).toBe(false);
    });
  });

  describe('normalizePhoneE164', () => {
    it('deve normalizar telefone brasileiro', () => {
      expect(normalizePhoneE164('48999990001')).toBe('+5548999990001');
      expect(normalizePhoneE164('(48) 99999-0001')).toBe('+5548999990001');
      expect(normalizePhoneE164('048999990001')).toBe('+5548999990001');
    });

    it('deve preservar código do país se já presente', () => {
      expect(normalizePhoneE164('+5548999990001')).toBe('+5548999990001');
      expect(normalizePhoneE164('5548999990001')).toBe('+5548999990001');
    });

    it('deve lançar erro para telefone inválido', () => {
      expect(() => normalizePhoneE164('123')).toThrow();
      expect(() => normalizePhoneE164('99999')).toThrow();
    });
  });

  describe('validateCPF', () => {
    it('deve validar CPF com 11 dígitos', () => {
      expect(validateCPF('12345678901')).toBe(true);
      expect(validateCPF('123.456.789-01')).toBe(true);
    });

    it('deve rejeitar CPF com tamanho incorreto', () => {
      expect(validateCPF('123456789')).toBe(false);
      expect(validateCPF('123456789012345')).toBe(false);
    });
  });

  describe('createNotificationKey', () => {
    it('deve criar chave única consistente', () => {
      const key1 = createNotificationKey('0001234-56.2024.8.24.0001', 'datajud', 'CONCLUSO', '2024-01-05');
      const key2 = createNotificationKey('0001234-56.2024.8.24.0001', 'datajud', 'CONCLUSO', '2024-01-05');

      expect(key1).toBe(key2);
      expect(key1).toBeTruthy();
    });

    it('deve criar chaves diferentes para eventos diferentes', () => {
      const key1 = createNotificationKey('0001234-56.2024.8.24.0001', 'datajud', 'CONCLUSO', '2024-01-05');
      const key2 = createNotificationKey('0001234-56.2024.8.24.0001', 'datajud', 'JUNTADA', '2024-01-05');

      expect(key1).not.toBe(key2);
    });
  });
});
