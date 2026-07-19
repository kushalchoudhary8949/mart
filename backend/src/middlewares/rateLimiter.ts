import rateLimit, { Store, MemoryStore } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';
import { config } from '../config';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../utils/constants';

const authRateLimitOptions = {
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: any, _res: any, next: any) => {
    next(new AppError('Too many requests, please try again later.', HTTP_STATUS.TOO_MANY_REQUESTS));
  },
};

class LazyRedisStore implements Store {
  private redisStore?: RedisStore;
  private memoryStore = new MemoryStore();
  private redisFailed = false;

  private getStore() {
    if (this.redisFailed) {
      return this.memoryStore;
    }

    if (redis.status === 'ready') {
      if (!this.redisStore) {
        try {
          this.redisStore = new RedisStore({
            // @ts-ignore
            sendCommand: async (...args: string[]) => {
              return redis.call(args[0], ...args.slice(1));
            },
          });
        } catch (err) {
          console.warn('⚠️ Failed to initialize RedisStore for rate limiter, falling back to MemoryStore:', err);
          this.redisFailed = true;
          return this.memoryStore;
        }
      }
      return this.redisStore;
    }
    return this.memoryStore;
  }

  async increment(key: string) {
    const store = this.getStore();
    try {
      return await store.increment(key);
    } catch (err) {
      console.warn('⚠️ Rate limiter store error, falling back to MemoryStore:', err);
      if (store === this.redisStore) {
        this.redisFailed = true;
      }
      return this.memoryStore.increment(key);
    }
  }

  async decrement(key: string) {
    const store = this.getStore();
    try {
      await store.decrement(key);
    } catch (err) {
      console.warn('⚠️ Rate limiter store error, falling back to MemoryStore:', err);
      if (store === this.redisStore) {
        this.redisFailed = true;
      }
      await this.memoryStore.decrement(key);
    }
  }

  async resetKey(key: string) {
    const store = this.getStore();
    try {
      await store.resetKey(key);
    } catch (err) {
      console.warn('⚠️ Rate limiter store error, falling back to MemoryStore:', err);
      if (store === this.redisStore) {
        this.redisFailed = true;
      }
      await this.memoryStore.resetKey(key);
    }
  }
}

// Create a rate limiter middleware backed by LazyRedisStore
export const rateLimiter = rateLimit({
  store: new LazyRedisStore(),
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return (req.headers['cf-connecting-ip'] as string) || 
           (req.headers['x-real-ip'] as string) || 
           (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || 
           req.ip;
  },
  skip: () => config.env === 'development' || config.env === 'test',
  handler: (_req, _res, next) => {
    next(new AppError('Too many requests, please try again later.', HTTP_STATUS.TOO_MANY_REQUESTS));
  },
});

export const otpRequestLimiter = rateLimit({
  ...authRateLimitOptions,
  store: new LazyRedisStore(),
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    const ip = (req.headers['cf-connecting-ip'] as string) || 
               (req.headers['x-real-ip'] as string) || 
               (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || 
               req.ip;
    return `${ip}:otp`;
  },
  skip: () => config.env === 'development' || config.env === 'test',
});

export const loginAttemptLimiter = rateLimit({
  ...authRateLimitOptions,
  store: new LazyRedisStore(),
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    const ip = (req.headers['cf-connecting-ip'] as string) || 
               (req.headers['x-real-ip'] as string) || 
               (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || 
               req.ip;
    return `${ip}:login`;
  },
  skip: () => config.env === 'development' || config.env === 'test',
});

