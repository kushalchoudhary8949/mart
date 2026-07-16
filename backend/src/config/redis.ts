import Redis from 'ioredis';
import { config } from './index';
import { logger } from './logger';

let redis: Redis;

try {
  redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    ...(config.env === 'production' ? { tls: {} } : {}),

    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        logger.error('❌ Redis retry connection limit reached.');
        return null;
      }
      return Math.min(times * 100, 2000);
    },
  });

  redis.on('connect', () => {
    logger.info('🔑 Connecting to Redis...');
  });

  redis.on('ready', () => {
    logger.info('🚀 Redis connection established successfully.');
  });

  redis.on('error', (err) => {
    logger.error('❌ Redis error:', err);
  });
} catch (error) {
  logger.error('❌ Redis Client Initialization failed:', error);
  process.exit(1);
}

export async function pingRedis(): Promise<boolean> {
  try {
    const response = await redis.ping();
    return response === 'PONG';
  } catch (error) {
    logger.error('❌ Redis ping failed:', error);
    return false;
  }
}

export { redis };
