import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_VERSION: z.string().default('v1'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),
  REDIS_TLS: z.coerce.boolean().optional().default(false),
  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('30d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RATE_LIMIT_MAX: z.coerce.number().default(1000),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 mins
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment configuration:', parsedEnv.error.format());
  process.exit(1);
}

export const config = {
  port: parsedEnv.data.PORT,
  env: parsedEnv.data.NODE_ENV,
  apiVersion: parsedEnv.data.API_VERSION,
  db: {
    url: parsedEnv.data.DATABASE_URL,
  },
  redis: {
    url: parsedEnv.data.REDIS_URL,
    host: parsedEnv.data.REDIS_HOST,
    port: parsedEnv.data.REDIS_PORT,
    password: parsedEnv.data.REDIS_PASSWORD || undefined,
    tls: parsedEnv.data.REDIS_TLS,
  },
  jwt: {
    accessSecret: parsedEnv.data.JWT_ACCESS_SECRET,
    refreshSecret: parsedEnv.data.JWT_REFRESH_SECRET,
    accessExpiration: parsedEnv.data.JWT_ACCESS_EXPIRATION,
    refreshExpiration: parsedEnv.data.JWT_REFRESH_EXPIRATION,
  },
  cors: {
    origin: parsedEnv.data.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  },
  rateLimit: {
    max: parsedEnv.data.RATE_LIMIT_MAX,
    windowMs: parsedEnv.data.RATE_LIMIT_WINDOW_MS,
  },
};
