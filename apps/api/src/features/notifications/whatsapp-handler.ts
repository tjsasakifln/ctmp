import { logger } from '../../config/logger.js';
import { sendTextMessage, markAsRead } from '../../adapters/whatsapp/client.js';
import { findClientByPhone, createClient } from '../clients/repository.js';
import { findCasesByClientId, getLatestEventForCase } from '../cases/repository.js';
import { consultaDataJud } from '../tools/consulta-datajud.js';
import { consultaDJEN } from '../tools/consulta-djen.js';
import { formatLegalEventForUser } from '../../core/legal-translator.js';

interface WhatsAppMessagePayload {
  message: {
    from: string;
    id: string;
    type: string;
    text?: {
      body: string;
    };
  };
  contact?: {
    profile: {
      name: string;
    };
    wa_id: string;
  };
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  requestId: string;
}

export async function handleWhatsAppMessage(payload: WhatsAppMessagePayload): Promise<void> {
  const log = logger.child({ requestId: payload.requestId, messageId: payload.message.id });

  try {
    // Só processa mensagens de texto
    if (payload.message.type !== 'text' || !payload.message.text) {
      log.info('Mensagem não é texto, ignorando');
      return;
    }

    const from = `+${payload.message.from}`;
    const messageBody = payload.message.text.body.trim().toLowerCase();

    log.info({ from, messageBody }, 'Processando mensagem WhatsApp');

    // Marca como lida
    await markAsRead(payload.message.id, log);

    // Busca ou cria cliente
    let client = await findClientByPhone(from);

    if (!client) {
      log.info({ from }, 'Cliente não encontrado, criando novo');
      client = await createClient({
        phone: from,
        nome: payload.contact?.profile.name,
      });
    }

    log.info({ clientId: client.id }, 'Cliente identificado');

    // Busca cases do cliente
    const cases = await findCasesByClientId(client.id);

    // Se cliente tem NUP mapeado: consulta e envia resumo
    if (cases.length > 0) {
      const activeCase = cases[0]; // Por enquanto, pega o primeiro
      log.info({ caseId: activeCase.id, nup: activeCase.nup }, 'Cliente possui NUP');

      await handleClienteComNUP(from, activeCase, log);
    } else {
      // Cliente novo: pede NUP e oferece agendamento pago
      log.info({ clientId: client.id }, 'Cliente sem NUP, enviando instruções');
      await handleClienteNovo(from, client.nome, log);
    }
  } catch (error) {
    log.error({ error }, 'Erro ao processar mensagem WhatsApp');
    try {
      await sendTextMessage(
        `+${payload.message.from}`,
        'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.',
        log
      );
    } catch (sendError) {
      log.error({ error: sendError }, 'Erro ao enviar mensagem de erro');
    }
  }
}

async function handleClienteComNUP(
  to: string,
  activeCase: any,
  log: typeof logger
): Promise<void> {
  // Consulta DataJud e DJEN nos últimos 7 dias
  const dataFim = new Date();
  const dataInicio = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [dataJudResult, djenResult] = await Promise.all([
    consultaDataJud(activeCase.nup, log),
    consultaDJEN(
      {
        tribunal: activeCase.tribunal || 'TJSC',
        dataInicio: dataInicio.toISOString().split('T')[0],
        dataFim: dataFim.toISOString().split('T')[0],
        nup: activeCase.nup,
      },
      log
    ),
  ]);

  // Combina eventos
  const todosEventos = [
    ...(dataJudResult.movements || []),
    ...(djenResult.publicacoes || []),
  ].sort((a, b) => new Date(b.data_evento).getTime() - new Date(a.data_evento).getTime());

  if (todosEventos.length === 0) {
    // Busca último evento salvo no banco
    const ultimoEvento = await getLatestEventForCase(activeCase.id);

    if (ultimoEvento) {
      const dataFormatada = new Date(ultimoEvento.dataEvento).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      await sendTextMessage(
        to,
        `Olá! Consultei o andamento do seu processo *${activeCase.nup}*.\n\n` +
          `Sem novidades desde ${dataFormatada}.\n\n` +
          `Última movimentação: *${ultimoEvento.titulo}*`,
        log
      );
    } else {
      await sendTextMessage(
        to,
        `Olá! Consultei o andamento do seu processo *${activeCase.nup}*.\n\n` +
          `Nenhuma movimentação encontrada nos últimos 7 dias.`,
        log
      );
    }
    return;
  }

  // Formata o evento mais recente
  const eventoMaisRecente = todosEventos[0];
  const mensagemFormatada = formatLegalEventForUser(eventoMaisRecente);

  let resposta = `Olá! Consultei o andamento do seu processo *${activeCase.nup}*.\n\n`;
  resposta += `*Última atualização:*\n${mensagemFormatada}\n\n`;

  if (todosEventos.length > 1) {
    resposta += `\n_Foram encontradas ${todosEventos.length} movimentações nos últimos 7 dias._`;
  }

  await sendTextMessage(to, resposta, log);
}

async function handleClienteNovo(
  to: string,
  nome: string | null,
  log: typeof logger
): Promise<void> {
  const saudacao = nome ? `Olá, ${nome}!` : 'Olá!';

  const mensagem =
    `${saudacao}\n\n` +
    `Para consultar o andamento do seu processo, preciso do *número do processo (NUP)*.\n\n` +
    `📋 Formato: NNNNNNN-DD.AAAA.J.TT.OOOO\n` +
    `Exemplo: 0001234-56.2024.8.24.0001\n\n` +
    `Se você não tem o número do processo ou deseja agendar uma consulta jurídica paga, ` +
    `entre em contato conosco.\n\n` +
    `_Para consultas pagas, o valor é R$ 350,00._`;

  await sendTextMessage(to, mensagem, log);
}
