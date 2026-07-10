import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth } from '../lib/auth'

const cart = new Hono<AppEnv>()
cart.use('*', requireAuth)

async function getCartWithItems(db: D1Database, userId: number) {
  const { results } = await db
    .prepare(
      `SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.slug, p.price, p.mrp, p.unit, p.image, p.stock
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ? ORDER BY ci.created_at DESC`
    )
    .bind(userId)
    .all()

  const items = results as any[]
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0)
  const totalItems = items.reduce((sum, it) => sum + it.quantity, 0)

  return { items, subtotal: Math.round(subtotal * 100) / 100, total_items: totalItems }
}

/** GET /api/cart */
cart.get('/', async (c) => {
  const userId = c.get('userId')
  const cartData = await getCartWithItems(c.env.DB, userId)
  return c.json(cartData)
})

/** POST /api/cart - add item { product_id, quantity } */
cart.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json().catch(() => ({}))
  const productId = parseInt(body.product_id, 10)
  const quantity = Math.max(1, parseInt(body.quantity || 1, 10))

  if (!productId) return c.json({ error: 'product_id is required' }, 400)

  const product = await c.env.DB.prepare(`SELECT id, stock FROM products WHERE id = ?`).bind(productId).first<{ id: number; stock: number }>()
  if (!product) return c.json({ error: 'Product not found' }, 404)

  const existing = await c.env.DB.prepare(`SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?`)
    .bind(userId, productId)
    .first<{ id: number; quantity: number }>()

  if (existing) {
    const newQty = Math.min(product.stock, existing.quantity + quantity)
    await c.env.DB.prepare(`UPDATE cart_items SET quantity = ? WHERE id = ?`).bind(newQty, existing.id).run()
  } else {
    await c.env.DB.prepare(`INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)`)
      .bind(userId, productId, Math.min(product.stock, quantity))
      .run()
  }

  const cartData = await getCartWithItems(c.env.DB, userId)
  return c.json({ success: true, ...cartData })
})

/** PUT /api/cart/:productId - update quantity { quantity } */
cart.put('/:productId', async (c) => {
  const userId = c.get('userId')
  const productId = parseInt(c.req.param('productId'), 10)
  const body = await c.req.json().catch(() => ({}))
  const quantity = parseInt(body.quantity, 10)

  if (!quantity || quantity < 1) {
    await c.env.DB.prepare(`DELETE FROM cart_items WHERE user_id = ? AND product_id = ?`).bind(userId, productId).run()
  } else {
    await c.env.DB.prepare(`UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?`)
      .bind(quantity, userId, productId)
      .run()
  }

  const cartData = await getCartWithItems(c.env.DB, userId)
  return c.json({ success: true, ...cartData })
})

/** DELETE /api/cart/:productId */
cart.delete('/:productId', async (c) => {
  const userId = c.get('userId')
  const productId = parseInt(c.req.param('productId'), 10)
  await c.env.DB.prepare(`DELETE FROM cart_items WHERE user_id = ? AND product_id = ?`).bind(userId, productId).run()
  const cartData = await getCartWithItems(c.env.DB, userId)
  return c.json({ success: true, ...cartData })
})

/** DELETE /api/cart - clear entire cart */
cart.delete('/', async (c) => {
  const userId = c.get('userId')
  await c.env.DB.prepare(`DELETE FROM cart_items WHERE user_id = ?`).bind(userId).run()
  return c.json({ success: true, items: [], subtotal: 0, total_items: 0 })
})

export default cart
