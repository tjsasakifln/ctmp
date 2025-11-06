import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';
import { handleWhatsAppMessage } from '../features/notifications/whatsapp-handler.js';

// Schema para verificação do webhook
const verifyWebhookSchema = z.object({
  'hub.mode': z.literal('subscribe'),
  'hub.challenge': z.string(),
  'hub.verify_token': z.string(),
});

// Schema para mensagens do WhatsApp
const whatsappWebhookSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messaging_product: z.literal('whatsapp'),
            metadata: z.object({
              display_phone_number: z.string(),
              phone_number_id: z.string(),
            }),
            contacts: z.array(
              z.object({
                profile: z.object({
                  name: z.string(),
                }),
                wa_id: z.string(),
              })
            ).optional(),
            messages: z.array(
              z.object({
                from: z.string(),
                id: z.string(),
                timestamp: z.string(),
                type: z.enum(['text', 'image', 'audio', 'video', 'document']),
                text: z.object({ body: z.string() }).optional(),
              })
            ).optional(),
            statuses: z.array(z.any()).optional(),
          }),
          field: z.string(),
        })
      ),
    })
  ),
});

export async function webhookRoutes(fastify: FastifyInstance): Promise<void> {
  // GET - Verificação do webhook (setup inicial Meta)
  fastify.get('/whatsapp', async (request, reply) => {
    try {
      const query = verifyWebhookSchema.parse(request.query);

      if (query['hub.verify_token'] !== env.WHATSAPP_VERIFY_TOKEN) {
        throw new UnauthorizedError('Invalid verify token');
      }

      request.log.info('WhatsApp webhook verified successfully');
      return reply.send(query['hub.challenge']);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ ok: false, error: 'Invalid verification request' });
      }
      throw error;
    }
  });

  // POST - Recebe eventos do WhatsApp
  fastify.post('/whatsapp', async (request, reply) => {
    try {
      const payload = whatsappWebhookSchema.parse(request.body);

      request.log.info({ payload }, 'WhatsApp webhook received');

      // Processar cada entrada
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          const { messages, contacts } = change.value;

          if (messages && messages.length > 0) {
            for (const message of messages) {
              // Enfileirar processamento assíncrono
              // Por enquanto, processar de forma síncrona para MVP
              try {
                await handleWhatsAppMessage({
                  message,
                  contact: contacts?.[0],
                  metadata: change.value.metadata,
                  requestId: request.context.requestId,
                });
              } catch (error) {
                request.log.error(
                  { error, messageId: message.id },
                  'Error handling WhatsApp message'
                );
                // Não falhar o webhook por erro em mensagem individual
              }
            }
          }
        }
      }

      // Sempre retornar 200 para não causar retry do Meta
      return reply.send({ ok: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        request.log.warn({ error: error.errors }, 'Invalid webhook payload');
        return reply.status(200).send({ ok: true }); // Retornar 200 mesmo assim
      }
      throw error;
    }
  });
}
