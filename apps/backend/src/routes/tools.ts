import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';
import { validateNUP } from '../utils/validators.js';
import { consultaDataJud } from '../features/tools/consulta-datajud.js';
import { consultaDJEN } from '../features/tools/consulta-djen.js';
import { buscarClientePorWhatsApp } from '../features/tools/buscar-cliente.js';
import { agendarConsulta } from '../features/tools/agendar-consulta.js';
import { emitirCobranca } from '../features/tools/emitir-cobranca.js';

export async function toolsRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /tools/consulta_datajud
  fastify.post('/consulta_datajud', async (request, reply) => {
    const schema = z.object({
      nup: z.string().refine(validateNUP, { message: 'NUP inválido' }),
    });

    const body = schema.parse(request.body);
    const result = await consultaDataJud(body.nup, request.log);

    return reply.send(result);
  });

  // POST /tools/consulta_djen
  fastify.post('/consulta_djen', async (request, reply) => {
    const schema = z.object({
      tribunal: z.string().min(2).max(10),
      data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      nup: z.string().optional(),
    });

    const body = schema.parse(request.body);

    if (body.nup && !validateNUP(body.nup)) {
      throw new ValidationError('NUP inválido');
    }

    const result = await consultaDJEN(
      {
        tribunal: body.tribunal,
        dataInicio: body.data_inicio,
        dataFim: body.data_fim,
        nup: body.nup,
      },
      request.log
    );

    return reply.send(result);
  });

  // POST /tools/buscar_cliente_por_whatsapp
  fastify.post('/buscar_cliente_por_whatsapp', async (request, reply) => {
    const schema = z.object({
      phone: z.string().min(10),
    });

    const body = schema.parse(request.body);
    const result = await buscarClientePorWhatsApp(body.phone, request.log);

    return reply.send(result);
  });

  // POST /tools/agendar_consulta
  fastify.post('/agendar_consulta', async (request, reply) => {
    const schema = z.object({
      cliente_id: z.string().uuid(),
      slot: z.string().datetime(),
    });

    const body = schema.parse(request.body);
    const result = await agendarConsulta(
      {
        clienteId: body.cliente_id,
        slot: new Date(body.slot),
      },
      request.log
    );

    return reply.send(result);
  });

  // POST /tools/emitir_cobranca
  fastify.post('/emitir_cobranca', async (request, reply) => {
    const schema = z.object({
      cliente_id: z.string().uuid(),
      valor: z.number().positive(),
      descricao: z.string().min(1),
    });

    const body = schema.parse(request.body);
    const result = await emitirCobranca(
      {
        clienteId: body.cliente_id,
        valor: body.valor,
        descricao: body.descricao,
      },
      request.log
    );

    return reply.send(result);
  });
}
