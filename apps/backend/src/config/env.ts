import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // WhatsApp
  WHATSAPP_VERIFY_TOKEN: z.string().min(1),
  WHATSAPP_ACCESS_TOKEN: z.string().min(1),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),

  // Providers
  DATAJUD_PROVIDER: z.enum(['mock', 'http']).default('mock'),
  DATAJUD_API_URL: z.string().optional(),
  DATAJUD_API_KEY: z.string().optional(),

  DJEN_PROVIDER: z.enum(['mock', 'http']).default('mock'),
  DJEN_API_URL: z.string().optional(),
  DJEN_API_KEY: z.string().optional(),

  PAYMENTS_PROVIDER: z.enum(['mock', 'http']).default('mock'),
  PAYMENTS_API_URL: z.string().optional(),
  PAYMENTS_API_KEY: z.string().optional(),

  CALENDAR_PROVIDER: z.enum(['mock', 'http']).default('mock'),
  GOOGLE_CALENDAR_CREDENTIALS: z.string().optional(),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url(),

  // Feature Flags
  FEATURE_AGENT_REWRITE: z.string().transform((v) => v === 'true').default('false'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
