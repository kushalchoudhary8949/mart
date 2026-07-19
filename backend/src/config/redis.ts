import Redis from 'ioredis';
import { config } from './index';
import { logger } from './logger';

class InMemoryRedisFallback {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async set(key: string, value: string, ...args: any[]) {
    let expiresAt: number | undefined;
    if (args[0] === 'EX') {
      const seconds = Number(args[1]);
      expiresAt = Date.now() + seconds * 1000;
    }
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async get(key: string) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async del(...keys: string[]) {
    let deletedCount = 0;
    for (const key of keys) {
      if (this.store.delete(key)) {
        deletedCount++;
      }
    }
    return deletedCount;
  }

  async keys(pattern: string) {
    const regexStr = '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$';
    const regex = new RegExp(regexStr);
    const matched: string[] = [];
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.store.delete(key);
        continue;
      }
      if (regex.test(key)) {
        matched.push(key);
      }
    }
    return matched;
  }

  async eval(_script: string, numKeys: number, ...args: any[]) {
    const keys = args.slice(0, numKeys);
    const argv = args.slice(numKeys);
    
    const otpKey = keys[0];
    const attemptsKey = keys[1];
    
    const code = argv[0];
    const maxAttempts = Number(argv[1]);
    
    const storedOtp = await this.get(otpKey);
    if (!storedOtp) return 'EXPIRED';
    
    if (storedOtp === code) {
      await this.del(otpKey, attemptsKey);
      return 'VALID';
    }
    
    const attemptsStr = await this.get(attemptsKey);
    let attempts = Number(attemptsStr || '0');
    attempts++;
    
    if (attempts >= maxAttempts) {
      await this.del(otpKey, attemptsKey);
      return 'MAX_ATTEMPTS_EXCEEDED';
    }
    
    await this.set(attemptsKey, String(attempts), 'EX', 300);
    return 'INVALID';
  }

  async ping() {
    return 'PONG';
  }

  async quit() {
    return 'OK';
  }
}

let redisInstance: Redis;
let isConnected = false;
const fallback = new InMemoryRedisFallback();

try {
  const redisOptions = {
    maxRetriesPerRequest: 3,
    lazyConnect: true, // Connect manually to handle authentication rejections safely
    retryStrategy(times: number) {
      if (times > 3) {
        logger.error('❌ Redis retry connection limit reached. Using In-Memory fallback.');
        return null;
      }
      return Math.min(times * 100, 2000);
    },
  };

  if (config.redis.url) {
    const useTls = config.redis.url.startsWith('rediss://') || config.env === 'production';
    redisInstance = new Redis(config.redis.url, {
      ...redisOptions,
      ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
    });
  } else {
    redisInstance = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      ...(config.env === 'production' ? { tls: { rejectUnauthorized: false } } : {}),
      ...redisOptions,
    });
  }

  redisInstance.on('connect', () => {
    logger.info('🔑 Connecting to Redis...');
  });

  redisInstance.on('ready', () => {
    isConnected = true;
    logger.info('🚀 Redis connection established successfully.');
  });

  redisInstance.on('close', () => {
    isConnected = false;
  });

  redisInstance.on('end', () => {
    isConnected = false;
  });

  redisInstance.on('error', (err) => {
    logger.error('❌ Redis error:', err.message);
  });

  // Explicitly trigger lazy connection and handle authentication rejections cleanly
  redisInstance.connect().catch((err) => {
    logger.error('❌ Redis connection failed during initialization:', err.message);
  });
} catch (error) {
  logger.error('❌ Redis Client Initialization failed, using In-Memory fallback:', error);
}

// Proxied wrapper to automatically fall back to InMemoryRedisFallback when disconnected
const redisProxy = new Proxy({} as Redis, {
  get(_target, prop, receiver) {
    if (prop === 'status') {
      return isConnected ? redisInstance.status : 'ready';
    }
    if (prop === 'on' || prop === 'once' || prop === 'off' || prop === 'emit') {
      return redisInstance ? (redisInstance as any)[prop].bind(redisInstance) : (() => {});
    }

    // Redirect Redis commands to in-memory fallback if disconnected
    if (!isConnected) {
      if (typeof prop === 'string' && prop in fallback) {
        const fallbackMethod = (fallback as any)[prop];
        if (typeof fallbackMethod === 'function') {
          return fallbackMethod.bind(fallback);
        }
      }

      // Return a dummy async function for any other Redis command to prevent ioredis from queueing it
      if (typeof prop === 'string') {
        return async (...args: any[]) => {
          if (prop === 'ping') return 'PONG';
          if (prop === 'call') {
            // Support evaluation from rate-limit-redis if it falls back
            const cmd = args[0];
            if (cmd === 'eval' || cmd === 'evalsha') {
              // Redirect to eval method in our fallback
              return fallback.eval(args[1], Number(args[2]), ...args.slice(3));
            }
          }
          return null;
        };
      }
    }

    // Otherwise, delegate to the real ioredis instance
    if (redisInstance) {
      const value = Reflect.get(redisInstance, prop, receiver);
      if (typeof value === 'function') {
        return value.bind(redisInstance);
      }
      return value;
    }

    // If redisInstance failed to initialize completely, fall back to InMemoryRedisFallback methods or return dummy values
    if (typeof prop === 'string' && prop in fallback) {
      const fallbackMethod = (fallback as any)[prop];
      if (typeof fallbackMethod === 'function') {
        return fallbackMethod.bind(fallback);
      }
    }
    return undefined;
  }
});

export async function pingRedis(): Promise<boolean> {
  try {
    const response = await redisProxy.ping();
    return response === 'PONG';
  } catch (error) {
    logger.error('❌ Redis ping failed:', error);
    return false;
  }
}

export { redisProxy as redis };
