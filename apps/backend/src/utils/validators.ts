import { ValidationError } from './errors.js';

/**
 * Valida formato e dígito verificador de NUP (Número Único de Processo)
 * Formato: NNNNNNN-DD.AAAA.J.TT.OOOO
 * onde DD são dígitos verificadores calculados por módulo 97
 */
export function validateNUP(nup: string): boolean {
  // Remove caracteres não numéricos
  const digits = nup.replace(/\D/g, '');

  // Deve ter exatamente 20 dígitos
  if (digits.length !== 20) {
    return false;
  }

  // Valida formato com regex
  const nupRegex = /^\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}$/;
  if (!nupRegex.test(nup)) {
    return false;
  }

  // Extrai componentes
  const sequencial = digits.substring(0, 7);
  const digitosVerificadores = digits.substring(7, 9);
  const ano = digits.substring(9, 13);
  const segmento = digits.substring(13, 14);
  const tribunal = digits.substring(14, 16);
  const origem = digits.substring(16, 20);

  // Calcula dígitos verificadores (módulo 97)
  const baseCalculo = origem + ano + segmento + tribunal + sequencial + '00';
  const resto = BigInt(baseCalculo) % 97n;
  const dvCalculado = (98n - resto).toString().padStart(2, '0');

  return dvCalculado === digitosVerificadores;
}

/**
 * Valida e normaliza número de telefone para formato E.164
 * Aceita formatos brasileiros comuns
 */
export function normalizePhoneE164(phone: string): string {
  // Remove caracteres não numéricos
  let digits = phone.replace(/\D/g, '');

  // Se começa com 0, remove
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  // Se não tem código do país, assume Brasil (+55)
  if (!digits.startsWith('55') && digits.length >= 10) {
    digits = '55' + digits;
  }

  // Valida tamanho (55 + DDD(2) + número(8 ou 9))
  if (digits.length < 12 || digits.length > 13) {
    throw new ValidationError('Número de telefone inválido');
  }

  return '+' + digits;
}

/**
 * Valida CPF (sem considerar dígitos verificadores por simplicidade)
 */
export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  return digits.length === 11;
}

/**
 * Cria chave única para idempotência de notificações
 */
export function createNotificationKey(
  nup: string,
  origem: string,
  codigo: string,
  dataEvento: string
): string {
  const normalized = `${nup}:${origem}:${codigo}:${dataEvento}`;
  // Simples hash string (para produção, use crypto.createHash)
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
