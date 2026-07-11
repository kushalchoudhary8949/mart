import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { generateOtp, generateToken, normalizePhone, isValidPhone, isValidEmail } from '../lib/utils'
import { requireAuth } from '../lib/auth'
import { rateLimit } from '../lib/rateLimit'

const auth = new Hono<AppEnv>()

const OTP_TTL_MINUTES = 5
const SESSION_TTL_DAYS = 30

/**
 * POST /api/auth/otp/request
 * body: { phone, purpose: 'login'|'signup' }
 * Generates and "sends" an OTP (SMS gateway not configured -> OTP is returned
 * in the response as `debug_otp` for demo/testing purposes only).
 */
auth.post('/otp/request', rateLimit(5, 60000), async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const phone = normalizePhone(body.phone)
  const purpose = body.purpose === 'signup' ? 'signup' : 'login'

  if (!phone || !isValidPhone(phone)) {
    return c.json({ error: 'Please provide a valid 10-digit mobile number.' }, 400)
  }

  const code = generateOtp(6)
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60000).toISOString().replace('T', ' ').substring(0, 19)

  // Invalidate previous unused OTPs for this phone/purpose
  await c.env.DB.prepare(`UPDATE otp_codes SET is_used = 1 WHERE phone = ? AND purpose = ? AND is_used = 0`)
    .bind(phone, purpose)
    .run()

  await c.env.DB.prepare(
    `INSERT INTO otp_codes (phone, code, purpose, expires_at) VALUES (?, ?, ?, ?)`
  )
    .bind(phone, code, purpose, expiresAt)
    .run()

  // NOTE: No real SMS gateway is configured in this project.
  // In production, integrate Twilio/MSG91/etc. here and remove `debug_otp` from the response.
  return c.json({
    success: true,
    message: `OTP sent to ${phone}`,
    ...(c.env.DEV_MODE === 'true' ? { debug_otp: code } : {}),
    expires_in_seconds: OTP_TTL_MINUTES * 60
  })
})

/**
 * POST /api/auth/otp/verify
 * body: { phone, code, name? }
 * Verifies OTP, creates user if needed, issues a session token.
 */
auth.post('/otp/verify', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const phone = normalizePhone(body.phone)
  const code = String(body.code || '').trim()
  const name = body.name ? String(body.name).trim().substring(0, 100) : null

  if (!phone || !code) {
    return c.json({ error: 'Phone and OTP code are required.' }, 400)
  }

  const otp = await c.env.DB.prepare(
    `SELECT id, code, expires_at, is_used, attempts FROM otp_codes
     WHERE phone = ? ORDER BY id DESC LIMIT 1`
  )
    .bind(phone)
    .first<{ id: number; code: string; expires_at: string; is_used: number; attempts: number }>()

  if (!otp) {
    return c.json({ error: 'No OTP request found. Please request a new OTP.' }, 400)
  }
  if (otp.is_used) {
    return c.json({ error: 'This OTP has already been used. Please request a new one.' }, 400)
  }
  if (new Date(otp.expires_at + 'Z').getTime() < Date.now()) {
    return c.json({ error: 'OTP has expired. Please request a new one.' }, 400)
  }
  if (otp.attempts >= 5) {
    return c.json({ error: 'Too many incorrect attempts. Please request a new OTP.' }, 400)
  }
  if (otp.code !== code) {
    await c.env.DB.prepare(`UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?`).bind(otp.id).run()
    return c.json({ error: 'Incorrect OTP. Please try again.' }, 400)
  }

  await c.env.DB.prepare(`UPDATE otp_codes SET is_used = 1 WHERE id = ?`).bind(otp.id).run()

  // Find or create user
  let user = await c.env.DB.prepare(`SELECT id, phone, name, email FROM users WHERE phone = ?`)
    .bind(phone)
    .first<{ id: number; phone: string; name: string | null; email: string | null }>()

  if (!user) {
    const insertResult = await c.env.DB.prepare(
      `INSERT INTO users (phone, name) VALUES (?, ?)`
    )
      .bind(phone, name)
      .run()
    const userId = insertResult.meta.last_row_id
    user = { id: userId, phone, name, email: null }

    await c.env.DB.prepare(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`
    )
      .bind(userId, 'Welcome to Grocery Mart! 🛒', 'Thanks for signing up. Use code WELCOME50 for ₹50 off your first order.', 'promo')
      .run()
  } else if (name && !user.name) {
    await c.env.DB.prepare(`UPDATE users SET name = ? WHERE id = ?`).bind(name, user.id).run()
    user.name = name
  }

  const token = generateToken(32)
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400000).toISOString().replace('T', ' ').substring(0, 19)

  await c.env.DB.prepare(`INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`)
    .bind(token, user.id, expiresAt)
    .run()

  return c.json({ success: true, token, user })
})

/** GET /api/auth/me - returns current authenticated user */
auth.get('/me', requireAuth, async (c) => {
  const userId = c.get('userId')
  const user = await c.env.DB.prepare(`SELECT id, phone, name, email, created_at FROM users WHERE id = ?`)
    .bind(userId)
    .first()
  return c.json({ user })
})

/** POST /api/auth/logout - invalidate current session token */
auth.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null
  if (token) {
    await c.env.DB.prepare(`DELETE FROM sessions WHERE token = ?`).bind(token).run()
  }
  return c.json({ success: true })
})

/** PUT /api/auth/profile - update name/email */
auth.put('/profile', requireAuth, async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json().catch(() => ({}))
  const name = body.name ? String(body.name).trim().substring(0, 100) : null
  const email = body.email ? String(body.email).trim().substring(0, 150) : null

  if (email && !isValidEmail(email)) {
    return c.json({ error: 'Please provide a valid email address.' }, 400)
  }

  await c.env.DB.prepare(`UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?`)
    .bind(name, email, userId)
    .run()

  const user = await c.env.DB.prepare(`SELECT id, phone, name, email FROM users WHERE id = ?`).bind(userId).first()
  return c.json({ success: true, user })
})

export default auth
