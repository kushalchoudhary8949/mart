import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth } from '../lib/auth'

const addresses = new Hono<AppEnv>()
addresses.use('*', requireAuth)

/** GET /api/addresses */
addresses.get('/', async (c) => {
  const userId = c.get('userId')
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`
  )
    .bind(userId)
    .all()
  return c.json({ addresses: results })
})

/** POST /api/addresses - { label, full_address, lat?, lng?, is_default? } */
addresses.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json().catch(() => ({}))
  const label = String(body.label || 'Home').substring(0, 50)
  const fullAddress = String(body.full_address || '').trim()
  const isDefault = body.is_default ? 1 : 0

  if (!fullAddress) return c.json({ error: 'full_address is required' }, 400)

  if (isDefault) {
    await c.env.DB.prepare(`UPDATE addresses SET is_default = 0 WHERE user_id = ?`).bind(userId).run()
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO addresses (user_id, label, full_address, lat, lng, is_default) VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(userId, label, fullAddress, body.lat || null, body.lng || null, isDefault)
    .run()

  return c.json({ success: true, id: result.meta.last_row_id })
})

/** GET /api/addresses/:id */
addresses.get('/:id', async (c) => {
  const userId = c.get('userId')
  const id = parseInt(c.req.param('id'), 10)
  const address = await c.env.DB.prepare(`SELECT * FROM addresses WHERE id = ? AND user_id = ?`)
    .bind(id, userId)
    .first()
  if (!address) return c.json({ error: 'Address not found' }, 404)
  return c.json({ address })
})

/** PUT /api/addresses/:id - { label, full_address, lat?, lng?, is_default? } */
addresses.put('/:id', async (c) => {
  const userId = c.get('userId')
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json().catch(() => ({}))

  const address = await c.env.DB.prepare(`SELECT id FROM addresses WHERE id = ? AND user_id = ?`)
    .bind(id, userId)
    .first()
  if (!address) return c.json({ error: 'Address not found' }, 404)

  const label = body.label ? String(body.label).substring(0, 50) : undefined
  const fullAddress = body.full_address ? String(body.full_address).trim() : undefined
  const isDefault = body.is_default !== undefined ? (body.is_default ? 1 : 0) : undefined

  if (isDefault) {
    await c.env.DB.prepare(`UPDATE addresses SET is_default = 0 WHERE user_id = ?`).bind(userId).run()
  }

  const updates: string[] = []
  const params: any[] = []

  if (label !== undefined) {
    updates.push('label = ?')
    params.push(label)
  }
  if (fullAddress !== undefined) {
    if (!fullAddress) return c.json({ error: 'full_address cannot be empty' }, 400)
    updates.push('full_address = ?')
    params.push(fullAddress)
  }
  if (body.lat !== undefined) {
    updates.push('lat = ?')
    params.push(body.lat)
  }
  if (body.lng !== undefined) {
    updates.push('lng = ?')
    params.push(body.lng)
  }
  if (isDefault !== undefined) {
    updates.push('is_default = ?')
    params.push(isDefault)
  }

  if (updates.length > 0) {
    params.push(id, userId)
    await c.env.DB.prepare(
      `UPDATE addresses SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
    )
      .bind(...params)
      .run()
  }

  return c.json({ success: true })
})

/** DELETE /api/addresses/:id */
addresses.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = parseInt(c.req.param('id'), 10)
  await c.env.DB.prepare(`DELETE FROM addresses WHERE id = ? AND user_id = ?`).bind(id, userId).run()
  return c.json({ success: true })
})

export default addresses
