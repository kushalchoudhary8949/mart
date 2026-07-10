import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth } from '../lib/auth'

const coupons = new Hono<AppEnv>()

/** GET /api/coupons - list active, non-expired coupons (public, for display) */
coupons.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT code, description, discount_type, discount_value, min_order_value, max_discount
     FROM coupons
     WHERE active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))
     ORDER BY id DESC`
  ).all()
  return c.json({ coupons: results })
})

/**
 * POST /api/coupons/validate
 * body: { code, subtotal }
 * Validates a coupon code against current cart subtotal, requires auth to check per-user usage in future.
 */
coupons.post('/validate', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const code = String(body.code || '').trim().toUpperCase()
  const subtotal = parseFloat(body.subtotal) || 0

  if (!code) return c.json({ error: 'Coupon code is required' }, 400)

  const coupon = await c.env.DB.prepare(
    `SELECT * FROM coupons WHERE code = ? AND active = 1`
  )
    .bind(code)
    .first<any>()

  if (!coupon) {
    return c.json({ valid: false, error: 'Invalid coupon code' }, 200)
  }
  if (coupon.expires_at && new Date(coupon.expires_at + 'Z').getTime() < Date.now()) {
    return c.json({ valid: false, error: 'This coupon has expired' }, 200)
  }
  if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
    return c.json({ valid: false, error: 'This coupon has reached its usage limit' }, 200)
  }
  if (subtotal < coupon.min_order_value) {
    return c.json({
      valid: false,
      error: `Minimum order value of ₹${coupon.min_order_value} required for this coupon`
    })
  }

  let discount = 0
  if (coupon.discount_type === 'percent') {
    discount = (subtotal * coupon.discount_value) / 100
    if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount)
  } else {
    discount = coupon.discount_value
  }
  discount = Math.round(Math.min(discount, subtotal) * 100) / 100

  return c.json({
    valid: true,
    code: coupon.code,
    description: coupon.description,
    discount
  })
})

export default coupons
