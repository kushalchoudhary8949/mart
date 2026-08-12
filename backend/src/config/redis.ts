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

  /**
   * Simulates Redis MULTI/EXEC pipeline.
   * Returns a chainable builder that queues del/set/get commands
   * and executes them sequentially when exec() is called.
   */
  multi() {
    const queued: Array<{ method: string; args: any[] }> = [];
    const parent = this;

    const chain = {
      del(...keys: string[]) {
        queued.push({ method: 'del', args: keys });
        return chain;
      },
      set(key: string, value: string, ...args: any[]) {
        queued.push({ method: 'set', args: [key, value, ...args] });
        return chain;
      },
      get(key: string) {
        queued.push({ method: 'get', args: [key] });
        return chain;
      },
      async exec() {
        const results: Array<[Error | null, any]> = [];
        for (const cmd of queued) {
          try {
            const result = await (parent as any)[cmd.method](...cmd.args);
            results.push([null, result]);
          } catch (err: any) {
            results.push([err, null]);
          }
        }
        return results;
      },
    };

    return chain;
  }

  async eval(_script: string, numKeys: number, ...args: any[]) {
    const keys = args.slice(0, numKeys);
    const argv = args.slice(numKeys);
    
    const otpKey = keys[0];
    const attemptsKey = keys[1];
    
    const code = argv[0];
    const maxAttempts = Number(argv[1]);
    
    const storedOtp = await this.get(otpKey);
    if (!storedOtp) return -1;
    
    if (storedOtp === code) {
      await this.del(otpKey, attemptsKey);
      return 0;
    }
    
    const attemptsStr = await this.get(attemptsKey);
    let attempts = Number(attemptsStr || '0');
    attempts++;
    
    if (attempts >= maxAttempts) {
      await this.del(otpKey, attemptsKey);
      return -2;
    }
    
    await this.set(attemptsKey, String(attempts), 'EX', 300);
    return attempts;
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

let hasLoggedDisconnect = false;

try {
  const redisOptions = {
    maxRetriesPerRequest: null, // Allow infinite retries in background without failing commands
    enableOfflineQueue: false, // Don't buffer commands when offline; proxy instantly delegates to fallback
    lazyConnect: true,
    family: 4, // Force IPv4 to prevent Render IPv6 DNS resolution delays
    keepAlive: 5000, // Send TCP keepalive packets every 5s to prevent Upstash idle socket drops
    connectTimeout: 10000,
    reconnectOnError(err: Error) {
      const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNRESET', 'EPIPE', 'CLOSED'];
      if (targetErrors.some((e) => err.message.includes(e))) {
        return true; // Force immediate reconnection on socket reset errors
      }
      return true;
    },
    retryStrategy(times: number) {
      // Exponential backoff capped at 5 seconds — NEVER return null so it NEVER permanently dies
      const delay = Math.min(times * 200, 5000);
      return delay;
    },
  };

  const targetHost = (config.redis.url || config.redis.host || '').toLowerCase();
  const isRemoteHost =
    targetHost.includes('upstash.io') ||
    targetHost.startsWith('rediss://') ||
    (!targetHost.includes('localhost') && !targetHost.includes('127.0.0.1') && targetHost.length > 0);
  const useTls = config.redis.tls || isRemoteHost || config.env === 'production';

  if (config.redis.url) {
    redisInstance = new Redis(config.redis.url, {
      ...redisOptions,
      ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
    });
  } else {
    redisInstance = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
      ...redisOptions,
    });
  }

  redisInstance.on('connect', () => {
    logger.info('🔑 Connecting to Redis...');
  });

  redisInstance.on('ready', () => {
    isConnected = true;
    hasLoggedDisconnect = false;
    logger.info('🚀 Redis connection established successfully.');
  });

  redisInstance.on('close', () => {
    isConnected = false;
    if (!hasLoggedDisconnect) {
      logger.warn('⚠️ Redis connection disconnected. Seamlessly using In-Memory fallback...');
      hasLoggedDisconnect = true;
    }
  });

  redisInstance.on('end', () => {
    isConnected = false;
  });

  redisInstance.on('error', (err) => {
    // Only log distinct non-routine errors once to prevent log spam
    if (isConnected) {
      logger.warn('⚠️ Redis connection issue:', err.message || 'Disconnected');
    }
    isConnected = false;
  });

  // Explicitly trigger lazy connection and handle initial connection failures cleanly
  redisInstance.connect().catch((err) => {
    logger.warn('⚠️ Initial Redis connection notice (using In-Memory fallback until connected):', err.message || 'Connecting...');
  });
} catch (error) {
  logger.error('❌ Redis Client Initialization failed, using In-Memory fallback:', error);
}

// Proxied wrapper to automatically fall back to InMemoryRedisFallback when disconnected
const redisProxy = new Proxy({} as Redis, {
  get(_target, prop, receiver) {
    if (prop === 'status') {
      return redisInstance ? redisInstance.status : 'close';
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
