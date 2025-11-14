import legalDict from './legal_dict.json' assert { type: 'json' };

/**
 * Tradutor determinístico de juridiquês para português simples
 * Não usa IA, apenas substituições de dicionário para evitar alucinação
 */
export function translateLegalese(texto: string): string {
  if (!texto) return texto;

  let translated = texto;

  // Ordena termos por tamanho (mais longos primeiro) para evitar substituições parciais
  const sortedTerms = Object.keys(legalDict).sort((a, b) => b.length - a.length);

  for (const term of sortedTerms) {
    // Case-insensitive replacement preservando a capitalização
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    translated = translated.replace(regex, (match) => {
      const translation = legalDict[term as keyof typeof legalDict];

      // Preserva maiúscula inicial se o original tinha
      if (match[0] === match[0].toUpperCase()) {
        return translation.charAt(0).toUpperCase() + translation.slice(1);
      }

      return translation;
    });
  }

  return translated;
}

/**
 * Formata evento legal para mensagem amigável ao usuário
 */
export function formatLegalEventForUser(event: {
  titulo: string;
  descricao?: string | null;
  data_evento: string;
}): string {
  const data = new Date(event.data_evento);
  const dataFormatada = data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const horaFormatada = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const tituloTraduzido = translateLegalese(event.titulo);
  const descricaoTraduzida = event.descricao ? translateLegalese(event.descricao) : null;

  let mensagem = `*${tituloTraduzido}*\n`;
  mensagem += `📅 ${dataFormatada} às ${horaFormatada}\n`;

  if (descricaoTraduzida && descricaoTraduzida !== tituloTraduzido) {
    mensagem += `\n${descricaoTraduzida}`;
  }

  return mensagem;
}
