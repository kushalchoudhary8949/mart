import type { Context, Next } from 'hono'
import type { AppEnv } from '../types'

type RateLimitInfo = {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitInfo>()

function clearExpiredEntries(now: number) {
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

export function rateLimit(
  limit: number, 
  windowMs: number, 
  keyGenerator?: (c: Context<AppEnv>) => Promise<string> | string
) {
  return async (c: Context<AppEnv>, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Real-IP') || '127.0.0.1'
    const route = c.req.path
    
    let identifier = ip
    if (keyGenerator) {
      try {
        const customKey = await keyGenerator(c)
        if (customKey) identifier = customKey
      } catch (_) {}
    }

    const key = `${identifier}:${route}`
    const now = Date.now()

    clearExpiredEntries(now)

    let limitInfo = rateLimitMap.get(key)

    if (!limitInfo || now > limitInfo.resetTime) {
      limitInfo = {
        count: 0,
        resetTime: now + windowMs
      }
    }

    limitInfo.count++
    rateLimitMap.set(key, limitInfo)

    c.header('X-RateLimit-Limit', String(limit))
    c.header('X-RateLimit-Remaining', String(Math.max(0, limit - limitInfo.count)))
    c.header('X-RateLimit-Reset', String(Math.ceil((limitInfo.resetTime - now) / 1000)))

    if (limitInfo.count > limit) {
      return c.json({ error: 'Too many requests for this mobile number. Please try again in a few moments.' }, 429)
    }

    await next()
  }
}
