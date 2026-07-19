import Redis from 'ioredis';
import { config } from './index';
import { logger } from './logger';

let redis: Redis;

try {
  const redisOptions = {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      if (times > 3) {
        logger.error('❌ Redis retry connection limit reached.');
        return null;
      }
      return Math.min(times * 100, 2000);
    },
  };

  if (config.redis.url) {
    const useTls = config.redis.url.startsWith('rediss://') || config.env === 'production';
    redis = new Redis(config.redis.url, {
      ...redisOptions,
      ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
    });
  } else {
    redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      ...(config.env === 'production' ? { tls: { rejectUnauthorized: false } } : {}),
      ...redisOptions,
    });
  }

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
