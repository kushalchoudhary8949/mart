import type { Context, Next } from 'hono'
import type { AppEnv } from '../types'

/**
 * Middleware that requires a valid session bearer token.
 * Looks up the token in the `sessions` table and attaches `userId` to context.
 */
export async function requireAuth(c: Context<AppEnv>, next: Next) {
  const authHeader = c.req.header('Authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null

  if (!token) {
    return c.json({ error: 'Unauthorized: missing token' }, 401)
  }

  const session = await c.env.DB.prepare(
    `SELECT user_id, expires_at FROM sessions WHERE token = ?`
  )
    .bind(token)
    .first<{ user_id: number; expires_at: string }>()

  if (!session) {
    return c.json({ error: 'Unauthorized: invalid token' }, 401)
  }

  if (new Date(session.expires_at + 'Z').getTime() < Date.now()) {
    return c.json({ error: 'Unauthorized: session expired' }, 401)
  }

  c.set('userId', session.user_id)
  await next()
}
