import rateLimit, { Store, MemoryStore } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';
import { config } from '../config';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../utils/constants';

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
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.max, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_req, _res, next) => {
    next(new AppError('Too many requests, please try again later.', HTTP_STATUS.TOO_MANY_REQUESTS));
  },
});

