import { env } from '../../config/env.js';
import { ExternalServiceError } from '../../utils/errors.js';
import type { WhatsAppOutgoingMessage } from '../../types/index.js';
import type { Logger } from '../../config/logger.js';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 segundo

interface SendMessageResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = INITIAL_RETRY_DELAY,
  logger?: Logger
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }

    logger?.warn({ retries, delay, error }, 'Retrying WhatsApp API call');
    await sleep(delay);
    return retryWithExponentialBackoff(fn, retries - 1, delay * 2, logger);
  }
}

export async function sendWhatsAppMessage(
  message: WhatsAppOutgoingMessage,
  logger?: Logger
): Promise<string> {
  const url = `${WHATSAPP_API_URL}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const sendRequest = async (): Promise<SendMessageResponse> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        ...message,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger?.error({ status: response.status, body: errorBody }, 'WhatsApp API error');
      throw new ExternalServiceError('WhatsApp', {
        status: response.status,
        body: errorBody,
      });
    }

    return response.json();
  };

  try {
    const result = await retryWithExponentialBackoff(sendRequest, MAX_RETRIES, INITIAL_RETRY_DELAY, logger);
    logger?.info({ messageId: result.messages[0].id, to: message.to }, 'WhatsApp message sent');
    return result.messages[0].id;
  } catch (error) {
    logger?.error({ error, message }, 'Failed to send WhatsApp message after retries');
    throw error;
  }
}

export async function sendTextMessage(to: string, text: string, logger?: Logger): Promise<string> {
  return sendWhatsAppMessage(
    {
      to,
      type: 'text',
      text: { body: text },
    },
    logger
  );
}

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  parameters: Array<{ type: string; text: string }>,
  logger?: Logger
): Promise<string> {
  return sendWhatsAppMessage(
    {
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters,
          },
        ],
      },
    },
    logger
  );
}

export async function markAsRead(messageId: string, logger?: Logger): Promise<void> {
  const url = `${WHATSAPP_API_URL}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });

    if (!response.ok) {
      logger?.warn({ messageId, status: response.status }, 'Failed to mark message as read');
    }
  } catch (error) {
    logger?.warn({ messageId, error }, 'Error marking message as read');
  }
}
