import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth } from '../lib/auth'

const wishlist = new Hono<AppEnv>()
wishlist.use('*', requireAuth)

/** GET /api/wishlist */
wishlist.get('/', async (c) => {
  const userId = c.get('userId')
  const { results } = await c.env.DB.prepare(
    `SELECT p.id, p.name, p.slug, p.price, p.mrp, p.unit, p.image, p.rating, p.stock
     FROM wishlist_items w JOIN products p ON p.id = w.product_id
     WHERE w.user_id = ? ORDER BY w.created_at DESC`
  )
    .bind(userId)
    .all()
  return c.json({ items: results })
})

/** POST /api/wishlist - { product_id } */
wishlist.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json().catch(() => ({}))
  const productId = parseInt(body.product_id, 10)
  if (!productId) return c.json({ error: 'product_id is required' }, 400)

  await c.env.DB.prepare(`INSERT OR IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)`)
    .bind(userId, productId)
    .run()

  return c.json({ success: true })
})

/** DELETE /api/wishlist/:productId */
wishlist.delete('/:productId', async (c) => {
  const userId = c.get('userId')
  const productId = parseInt(c.req.param('productId'), 10)
  await c.env.DB.prepare(`DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?`).bind(userId, productId).run()
  return c.json({ success: true })
})

export default wishlist
