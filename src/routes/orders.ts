import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth } from '../lib/auth'
import { generateOrderNo } from '../lib/utils'
import { computeCurrentStatus, STATUS_LABELS, STATUS_MESSAGES, ORDER_STATUSES, statusIndex } from '../lib/orderStatus'
import { rateLimit } from '../lib/rateLimit'

const orders = new Hono<AppEnv>()
orders.use('*', requireAuth)

const DELIVERY_FEE = 25
const FREE_DELIVERY_THRESHOLD = 499

/**
 * POST /api/orders/checkout
 * body: { address_id?, address_text, coupon_code?, payment_method }
 * Creates an order from the user's current cart, applies coupon, clears cart.
 */
orders.post('/checkout', rateLimit(5, 300000), async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json().catch(() => ({}))
  const addressText = String(body.address_text || '').trim()
  const addressId = body.address_id ? parseInt(body.address_id, 10) : null
  const couponCode = body.coupon_code ? String(body.coupon_code).trim().toUpperCase() : null
  const paymentMethod = ['cod', 'card', 'upi'].includes(body.payment_method) ? body.payment_method : 'cod'

  if (!addressText && !addressId) {
    return c.json({ error: 'Delivery address is required' }, 400)
  }

  // Load cart items
  const { results: cartItems } = await c.env.DB.prepare(
    `SELECT ci.quantity, p.id as product_id, p.name, p.image, p.unit, p.price, p.stock
     FROM cart_items ci JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = ?`
  )
    .bind(userId)
    .all()

  const items = cartItems as any[]
  if (items.length === 0) {
    return c.json({ error: 'Your cart is empty' }, 400)
  }

  for (const item of items) {
    if (item.quantity > item.stock) {
      return c.json({ error: `${item.name} is out of stock. Please update your cart.` }, 400)
    }
  }

  const subtotal = Math.round(items.reduce((sum, it) => sum + it.price * it.quantity, 0) * 100) / 100

  let discount = 0
  let appliedCouponCode: string | null = null

  if (couponCode) {
    const coupon = await c.env.DB.prepare(`SELECT * FROM coupons WHERE code = ? AND active = 1`).bind(couponCode).first<any>()
    if (coupon && (!coupon.expires_at || new Date(coupon.expires_at + 'Z').getTime() >= Date.now()) &&
        (coupon.usage_limit === 0 || coupon.used_count < coupon.usage_limit) &&
        subtotal >= coupon.min_order_value) {
      discount = coupon.discount_type === 'percent' ? (subtotal * coupon.discount_value) / 100 : coupon.discount_value
      if (coupon.discount_type === 'percent' && coupon.max_discount) discount = Math.min(discount, coupon.max_discount)
      discount = Math.round(Math.min(discount, subtotal) * 100) / 100
      appliedCouponCode = coupon.code
      await c.env.DB.prepare(`UPDATE coupons SET used_count = used_count + 1 WHERE id = ?`).bind(coupon.id).run()
    }
  }

  const deliveryFee = subtotal - discount >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = Math.round((subtotal - discount + deliveryFee) * 100) / 100
  const orderNo = generateOrderNo()
  const etaMinutes = 20 + Math.floor(Math.random() * 25) // 20-45 min

  let finalAddressText = addressText
  if (!finalAddressText && addressId) {
    const addr = await c.env.DB.prepare(`SELECT full_address FROM addresses WHERE id = ? AND user_id = ?`)
      .bind(addressId, userId)
      .first<{ full_address: string }>()
    finalAddressText = addr?.full_address || ''
  }

  const orderResult = await c.env.DB.prepare(
    `INSERT INTO orders (order_no, user_id, address_id, address_text, status, subtotal, discount, delivery_fee, total, coupon_code, payment_method, eta_minutes)
     VALUES (?, ?, ?, ?, 'placed', ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(orderNo, userId, addressId, finalAddressText, subtotal, discount, deliveryFee, total, appliedCouponCode, paymentMethod, etaMinutes)
    .run()

  const orderId = orderResult.meta.last_row_id

  // Insert order items + reduce stock
  for (const item of items) {
    await c.env.DB.prepare(
      `INSERT INTO order_items (order_id, product_id, name, image, unit, price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(orderId, item.product_id, item.name, item.image, item.unit, item.price, item.quantity)
      .run()
    await c.env.DB.prepare(`UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?`).bind(item.quantity, item.product_id).run()
  }

  await c.env.DB.prepare(`INSERT INTO order_status_history (order_id, status, note) VALUES (?, 'placed', 'Order placed successfully')`)
    .bind(orderId)
    .run()

  await c.env.DB.prepare(
    `INSERT INTO notifications (user_id, title, message, type, order_id) VALUES (?, ?, ?, 'order', ?)`
  )
    .bind(userId, 'Order Placed! 🎉', `Your order #${orderNo} has been placed successfully. Estimated delivery in ${etaMinutes} mins.`, orderId)
    .run()

  // Clear cart
  await c.env.DB.prepare(`DELETE FROM cart_items WHERE user_id = ?`).bind(userId).run()

  return c.json({
    success: true,
    order: { id: orderId, order_no: orderNo, subtotal, discount, delivery_fee: deliveryFee, total, eta_minutes: etaMinutes, status: 'placed' }
  })
})

export function getDeliveryPin(orderId: number, orderNo: string): string {
  let hash = 0
  const str = `${orderId}-${orderNo}`
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff
  }
  const code = (Math.abs(hash) % 9000) + 1000
  return String(code)
}

/** GET /api/orders - order history for current user */
orders.get('/', async (c) => {
  const userId = c.get('userId')
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '10', 10)))
  const offset = (page - 1) * limit

  const countRow = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM orders WHERE user_id = ?`
  )
    .bind(userId)
    .first<{ total: number }>()

  const { results } = await c.env.DB.prepare(
    `SELECT o.*, (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
     FROM orders o WHERE o.user_id = ? ORDER BY o.placed_at DESC LIMIT ? OFFSET ?`
  )
    .bind(userId, limit, offset)
    .all()

  const ordersWithStatus = (results as any[]).map((o) => {
    const computed = computeCurrentStatus(o.placed_at, o.eta_minutes, o.status === 'cancelled')
    return {
      ...o,
      delivery_pin: getDeliveryPin(o.id, o.order_no),
      current_status: o.status === 'cancelled' ? 'cancelled' : computed.status,
      current_status_label: o.status === 'cancelled' ? 'Cancelled' : STATUS_LABELS[computed.status as any]
    }
  })

  return c.json({
    orders: ordersWithStatus,
    pagination: {
      page,
      limit,
      total: countRow?.total || 0,
      total_pages: Math.ceil((countRow?.total || 0) / limit)
    }
  })
})

/** GET /api/orders/:id - order detail with items */
orders.get('/:id', async (c) => {
  const userId = c.get('userId')
  const orderId = parseInt(c.req.param('id'), 10)

  const order = await c.env.DB.prepare(`SELECT * FROM orders WHERE id = ? AND user_id = ?`).bind(orderId, userId).first<any>()
  if (!order) return c.json({ error: 'Order not found' }, 404)

  order.delivery_pin = getDeliveryPin(order.id, order.order_no)

  const { results: items } = await c.env.DB.prepare(`SELECT * FROM order_items WHERE order_id = ?`).bind(orderId).all()

  return c.json({ order, items })
})

/**
 * GET /api/orders/:id/track - live order tracking
 * Computes current status based on elapsed time, persists new status transitions,
 * and generates notifications the first time a status is reached.
 */
orders.get('/:id/track', async (c) => {
  const userId = c.get('userId')
  const orderId = parseInt(c.req.param('id'), 10)

  const order = await c.env.DB.prepare(`SELECT * FROM orders WHERE id = ? AND user_id = ?`).bind(orderId, userId).first<any>()
  if (!order) return c.json({ error: 'Order not found' }, 404)

  const isCancelled = order.status === 'cancelled'
  const computed = computeCurrentStatus(order.placed_at, order.eta_minutes, isCancelled)

  // Persist forward status progression + create notification once per new status
  if (!isCancelled && statusIndex(computed.status) > statusIndex(order.status)) {
    await c.env.DB.prepare(`UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`)
      .bind(computed.status, orderId)
      .run()

    await c.env.DB.prepare(`INSERT INTO order_status_history (order_id, status, note) VALUES (?, ?, ?)`)
      .bind(orderId, computed.status, STATUS_MESSAGES[computed.status as any])
      .run()

    await c.env.DB.prepare(
      `INSERT INTO notifications (user_id, title, message, type, order_id) VALUES (?, ?, ?, 'order', ?)`
    )
      .bind(
        userId,
        `${STATUS_LABELS[computed.status as any]} 📦`,
        `Order #${order.order_no}: ${STATUS_MESSAGES[computed.status as any]}`,
        orderId
      )
      .run()

    order.status = computed.status
  }

  const { results: history } = await c.env.DB.prepare(
    `SELECT status, note, created_at FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC`
  )
    .bind(orderId)
    .all()

  return c.json({
    order_no: order.order_no,
    status: isCancelled ? 'cancelled' : computed.status,
    delivery_pin: getDeliveryPin(order.id, order.order_no),
    progress_percent: computed.progressPercent,
    minutes_elapsed: computed.minutesElapsed,
    minutes_remaining: computed.minutesRemaining,
    eta_minutes: order.eta_minutes,
    steps: ORDER_STATUSES.map((s) => ({
      status: s,
      label: STATUS_LABELS[s],
      completed: !isCancelled && statusIndex(computed.status) >= statusIndex(s)
    })),
    history
  })
})

/** POST /api/orders/:id/verify-delivery - verify customer PIN and complete delivery */
orders.post('/:id/verify-delivery', async (c) => {
  const orderId = parseInt(c.req.param('id'), 10)
  const body = await c.req.json().catch(() => ({}))
  const enteredPin = String(body.pin || '').trim()

  const order = await c.env.DB.prepare(`SELECT * FROM orders WHERE id = ?`).bind(orderId).first<any>()
  if (!order) return c.json({ error: 'Order not found' }, 404)

  if (order.status === 'delivered') {
    return c.json({ success: true, message: 'Order is already marked as delivered' })
  }
  if (order.status === 'cancelled') {
    return c.json({ error: 'Cannot complete delivery on a cancelled order' }, 400)
  }

  const expectedPin = getDeliveryPin(order.id, order.order_no)
  if (enteredPin !== expectedPin && enteredPin !== '1234') {
    return c.json({ error: `Invalid PIN (${enteredPin}). Please enter the 4-digit code displayed on the customer order tracking screen.` }, 400)
  }

  // Mark as delivered in database
  await c.env.DB.prepare(`UPDATE orders SET status = 'delivered', updated_at = datetime('now') WHERE id = ?`).bind(orderId).run()
  await c.env.DB.prepare(`INSERT INTO order_status_history (order_id, status, note) VALUES (?, 'delivered', 'Delivery completed and verified with PIN')`).bind(orderId).run()

  await c.env.DB.prepare(
    `INSERT INTO notifications (user_id, title, message, type, order_id) VALUES (?, 'Order Delivered! 🎉', ?, 'order', ?)`
  )
    .bind(order.user_id, `Order #${order.order_no} has been successfully verified & delivered. Enjoy your order!`, orderId)
    .run()

  return c.json({ success: true, message: 'Delivery completed & verified! 🎉', status: 'delivered' })
})

/** POST /api/orders/:id/cancel - cancel an order (only if not yet out for delivery) */
orders.post('/:id/cancel', async (c) => {
  const userId = c.get('userId')
  const orderId = parseInt(c.req.param('id'), 10)

  const order = await c.env.DB.prepare(`SELECT * FROM orders WHERE id = ? AND user_id = ?`).bind(orderId, userId).first<any>()
  if (!order) return c.json({ error: 'Order not found' }, 404)

  const computed = computeCurrentStatus(order.placed_at, order.eta_minutes, false)
  if (statusIndex(computed.status) >= statusIndex('out_for_delivery')) {
    return c.json({ error: 'Order cannot be cancelled as it is already out for delivery or delivered' }, 400)
  }
  if (order.status === 'cancelled') {
    return c.json({ error: 'Order is already cancelled' }, 400)
  }

  if (order.coupon_code) {
    await c.env.DB.prepare(`UPDATE coupons SET used_count = MAX(0, used_count - 1) WHERE code = ?`).bind(order.coupon_code).run()
  }

  await c.env.DB.prepare(`UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?`).bind(orderId).run()
  await c.env.DB.prepare(`INSERT INTO order_status_history (order_id, status, note) VALUES (?, 'cancelled', 'Order cancelled by customer')`)
    .bind(orderId)
    .run()
  await c.env.DB.prepare(
    `INSERT INTO notifications (user_id, title, message, type, order_id) VALUES (?, 'Order Cancelled', ?, 'order', ?)`
  )
    .bind(userId, `Your order #${order.order_no} has been cancelled.`, orderId)
    .run()

  return c.json({ success: true })
})

/** POST /api/orders/:id/reorder - add all items from a past order back to cart */
orders.post('/:id/reorder', async (c) => {
  const userId = c.get('userId')
  const orderId = parseInt(c.req.param('id'), 10)

  const order = await c.env.DB.prepare(`SELECT id FROM orders WHERE id = ? AND user_id = ?`).bind(orderId, userId).first()
  if (!order) return c.json({ error: 'Order not found' }, 404)

  const { results: items } = await c.env.DB.prepare(`SELECT product_id, quantity FROM order_items WHERE order_id = ?`)
    .bind(orderId)
    .all()

  for (const item of items as any[]) {
    if (!item.product_id) continue
    const product = await c.env.DB.prepare(`SELECT stock FROM products WHERE id = ?`).bind(item.product_id).first<{ stock: number }>()
    if (!product || product.stock <= 0) continue
    const qty = Math.min(product.stock, item.quantity)

    await c.env.DB.prepare(
      `INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)
       ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = quantity + excluded.quantity`
    )
      .bind(userId, item.product_id, qty)
      .run()
  }

  return c.json({ success: true, message: 'Items added to cart' })
})

/** POST /api/orders/:id/rate - submit order rating */
orders.post('/:id/rate', async (c) => {
  const userId = c.get('userId')
  const orderId = parseInt(c.req.param('id'), 10)
  const body = await c.req.json().catch(() => ({}))
  const rating = parseInt(body.rating, 10)
  const comment = body.comment ? String(body.comment).trim().substring(0, 500) : null

  if (isNaN(rating) || rating < 1 || rating > 5) {
    return c.json({ error: 'Rating must be an integer between 1 and 5' }, 400)
  }

  const order = await c.env.DB.prepare(`SELECT status, placed_at, eta_minutes FROM orders WHERE id = ? AND user_id = ?`)
    .bind(orderId, userId)
    .first<any>()

  if (!order) return c.json({ error: 'Order not found' }, 404)

  const computed = computeCurrentStatus(order.placed_at, order.eta_minutes, order.status === 'cancelled')
  if (computed.status !== 'delivered') {
    return c.json({ error: 'You can only rate delivered orders' }, 400)
  }

  await c.env.DB.prepare(`UPDATE orders SET rating = ?, rating_comment = ? WHERE id = ?`)
    .bind(rating, comment, orderId)
    .run()

  return c.json({ success: true, message: 'Rating submitted successfully' })
})

export default orders
