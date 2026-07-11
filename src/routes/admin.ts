import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth } from '../lib/auth'

const admin = new Hono<AppEnv>()

// Protect all admin routes with auth
admin.use('*', requireAuth)

// Middleware to verify if user is admin
admin.use('*', async (c, next) => {
  const userId = c.get('userId')
  const user = await c.env.DB.prepare(`SELECT is_admin FROM users WHERE id = ?`)
    .bind(userId)
    .first<{ is_admin: number }>()

  if (!user || !user.is_admin) {
    return c.json({ error: 'Forbidden: Admin access required' }, 403)
  }
  await next()
})

// --- Dashboard Stats ---
admin.get('/dashboard', async (c) => {
  const productsCount = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM products`).first<{ count: number }>()
  const usersCount = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM users`).first<{ count: number }>()
  const ordersCount = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM orders`).first<{ count: number }>()
  const revenue = await c.env.DB.prepare(`SELECT SUM(total) as sum FROM orders WHERE status = 'delivered'`).first<{ sum: number }>()

  return c.json({
    stats: {
      products: productsCount?.count || 0,
      users: usersCount?.count || 0,
      orders: ordersCount?.count || 0,
      revenue: revenue?.sum || 0
    }
  })
})

// --- Products CRUD ---
admin.get('/products', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT p.*, c.name as category_name FROM products p JOIN categories c ON c.id = p.category_id ORDER BY p.id DESC`).all()
  return c.json({ products: results })
})

admin.post('/products', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const { category_id, name, slug, description, price, mrp, unit, image, stock, is_featured } = body

  if (!category_id || !name || !slug || price === undefined || mrp === undefined || !unit) {
    return c.json({ error: 'Missing required product fields' }, 400)
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO products (category_id, name, slug, description, price, mrp, unit, image, stock, is_featured, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
  )
    .bind(category_id, name, slug, description || null, price, mrp, unit, image || null, stock !== undefined ? stock : 100, is_featured ? 1 : 0)
    .run()

  return c.json({ success: true, id: result.meta.last_row_id })
})

admin.put('/products/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json().catch(() => ({}))
  const { category_id, name, slug, description, price, mrp, unit, image, stock, is_featured, is_active } = body

  const product = await c.env.DB.prepare(`SELECT id FROM products WHERE id = ?`).bind(id).first()
  if (!product) return c.json({ error: 'Product not found' }, 404)

  const updates: string[] = []
  const params: any[] = []

  const addUpdate = (col: string, val: any) => {
    if (val !== undefined) {
      updates.push(`${col} = ?`)
      params.push(val)
    }
  }

  addUpdate('category_id', category_id)
  addUpdate('name', name)
  addUpdate('slug', slug)
  addUpdate('description', description)
  addUpdate('price', price)
  addUpdate('mrp', mrp)
  addUpdate('unit', unit)
  addUpdate('image', image)
  addUpdate('stock', stock)
  addUpdate('is_featured', is_featured !== undefined ? (is_featured ? 1 : 0) : undefined)
  addUpdate('is_active', is_active !== undefined ? (is_active ? 1 : 0) : undefined)

  if (updates.length > 0) {
    params.push(id)
    await c.env.DB.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()
  }

  return c.json({ success: true })
})

admin.delete('/products/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  // Soft delete product
  await c.env.DB.prepare(`UPDATE products SET is_active = 0 WHERE id = ?`).bind(id).run()
  return c.json({ success: true, message: 'Product deactivated' })
})

// --- Categories CRUD ---
admin.get('/categories', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM categories ORDER BY sort_order ASC`).all()
  return c.json({ categories: results })
})

admin.post('/categories', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const { name, slug, icon, image, sort_order } = body

  if (!name || !slug) {
    return c.json({ error: 'Name and slug are required' }, 400)
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO categories (name, slug, icon, image, sort_order) VALUES (?, ?, ?, ?, ?)`
  )
    .bind(name, slug, icon || null, image || null, sort_order || 0)
    .run()

  return c.json({ success: true, id: result.meta.last_row_id })
})

admin.put('/categories/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json().catch(() => ({}))
  const { name, slug, icon, image, sort_order } = body

  const category = await c.env.DB.prepare(`SELECT id FROM categories WHERE id = ?`).bind(id).first()
  if (!category) return c.json({ error: 'Category not found' }, 404)

  const updates: string[] = []
  const params: any[] = []

  const addUpdate = (col: string, val: any) => {
    if (val !== undefined) {
      updates.push(`${col} = ?`)
      params.push(val)
    }
  }

  addUpdate('name', name)
  addUpdate('slug', slug)
  addUpdate('icon', icon)
  addUpdate('image', image)
  addUpdate('sort_order', sort_order)

  if (updates.length > 0) {
    params.push(id)
    await c.env.DB.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()
  }

  return c.json({ success: true })
})

admin.delete('/categories/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  await c.env.DB.prepare(`DELETE FROM categories WHERE id = ?`).bind(id).run()
  return c.json({ success: true })
})

// --- Orders Management ---
admin.get('/orders', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT o.*, u.phone, u.name as user_name FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.placed_at DESC`).all()
  return c.json({ orders: results })
})

admin.put('/orders/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json().catch(() => ({}))
  const { status, note } = body

  const validStatuses = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']
  if (!status || !validStatuses.includes(status)) {
    return c.json({ error: 'Invalid or missing order status' }, 400)
  }

  const order = await c.env.DB.prepare(`SELECT user_id, order_no FROM orders WHERE id = ?`).bind(id).first<any>()
  if (!order) return c.json({ error: 'Order not found' }, 404)

  await c.env.DB.prepare(`UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`)
    .bind(status, id)
    .run()

  await c.env.DB.prepare(`INSERT INTO order_status_history (order_id, status, note) VALUES (?, ?, ?)`)
    .bind(id, status, note || `Order status updated to ${status}`)
    .run()

  // Generate notification for user
  const STATUS_LABELS: Record<string, string> = {
    placed: 'Order Placed',
    confirmed: 'Order Confirmed',
    preparing: 'Preparing Order',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  }

  await c.env.DB.prepare(
    `INSERT INTO notifications (user_id, title, message, type, order_id) VALUES (?, ?, ?, 'order', ?)`
  )
    .bind(order.user_id, `${STATUS_LABELS[status]} 📦`, `Order #${order.order_no} status: ${note || STATUS_LABELS[status]}`, id)
    .run()

  return c.json({ success: true })
})

// --- Coupons CRUD ---
admin.get('/coupons', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM coupons ORDER BY id DESC`).all()
  return c.json({ coupons: results })
})

admin.post('/coupons', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const { code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, active, expires_at } = body

  if (!code || !discount_type || discount_value === undefined) {
    return c.json({ error: 'Code, discount type, and discount value are required' }, 400)
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, active, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(code.toUpperCase(), description || null, discount_type, discount_value, min_order_value || 0, max_discount || null, usage_limit || 0, active !== undefined ? (active ? 1 : 0) : 1, expires_at || null)
    .run()

  return c.json({ success: true, id: result.meta.last_row_id })
})

admin.put('/coupons/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json().catch(() => ({}))
  const { code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, active, expires_at } = body

  const coupon = await c.env.DB.prepare(`SELECT id FROM coupons WHERE id = ?`).bind(id).first()
  if (!coupon) return c.json({ error: 'Coupon not found' }, 404)

  const updates: string[] = []
  const params: any[] = []

  const addUpdate = (col: string, val: any) => {
    if (val !== undefined) {
      updates.push(`${col} = ?`)
      params.push(val)
    }
  }

  addUpdate('code', code ? code.toUpperCase() : undefined)
  addUpdate('description', description)
  addUpdate('discount_type', discount_type)
  addUpdate('discount_value', discount_value)
  addUpdate('min_order_value', min_order_value)
  addUpdate('max_discount', max_discount)
  addUpdate('usage_limit', usage_limit)
  addUpdate('active', active !== undefined ? (active ? 1 : 0) : undefined)
  addUpdate('expires_at', expires_at)

  if (updates.length > 0) {
    params.push(id)
    await c.env.DB.prepare(`UPDATE coupons SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()
  }

  return c.json({ success: true })
})

admin.delete('/coupons/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  await c.env.DB.prepare(`DELETE FROM coupons WHERE id = ?`).bind(id).run()
  return c.json({ success: true })
})

// --- Banners CRUD ---
admin.get('/banners', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM banners ORDER BY sort_order ASC`).all()
  return c.json({ banners: results })
})

admin.post('/banners', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const { title, subtitle, image, cta_text, cta_link, active, sort_order, expires_at } = body

  if (!title || !image) {
    return c.json({ error: 'Title and image URL are required' }, 400)
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO banners (title, subtitle, image, cta_text, cta_link, active, sort_order, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(title, subtitle || null, image, cta_text || 'Shop Now', cta_link || '/categories', active !== undefined ? (active ? 1 : 0) : 1, sort_order || 0, expires_at || null)
    .run()

  return c.json({ success: true, id: result.meta.last_row_id })
})

admin.put('/banners/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json().catch(() => ({}))
  const { title, subtitle, image, cta_text, cta_link, active, sort_order, expires_at } = body

  const banner = await c.env.DB.prepare(`SELECT id FROM banners WHERE id = ?`).bind(id).first()
  if (!banner) return c.json({ error: 'Banner not found' }, 404)

  const updates: string[] = []
  const params: any[] = []

  const addUpdate = (col: string, val: any) => {
    if (val !== undefined) {
      updates.push(`${col} = ?`)
      params.push(val)
    }
  }

  addUpdate('title', title)
  addUpdate('subtitle', subtitle)
  addUpdate('image', image)
  addUpdate('cta_text', cta_text)
  addUpdate('cta_link', cta_link)
  addUpdate('active', active !== undefined ? (active ? 1 : 0) : undefined)
  addUpdate('sort_order', sort_order)
  addUpdate('expires_at', expires_at)

  if (updates.length > 0) {
    params.push(id)
    await c.env.DB.prepare(`UPDATE banners SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()
  }

  return c.json({ success: true })
})

admin.delete('/banners/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  await c.env.DB.prepare(`DELETE FROM banners WHERE id = ?`).bind(id).run()
  return c.json({ success: true })
})

export default admin
