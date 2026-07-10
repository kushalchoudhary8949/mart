import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth } from '../lib/auth'

const notifications = new Hono<AppEnv>()
notifications.use('*', requireAuth)

/** GET /api/notifications - list notifications for current user */
notifications.get('/', async (c) => {
  const userId = c.get('userId')
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`
  )
    .bind(userId)
    .all()

  const unreadCount = await c.env.DB.prepare(`SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0`)
    .bind(userId)
    .first<{ c: number }>()

  return c.json({ notifications: results, unread_count: unreadCount?.c || 0 })
})

/** POST /api/notifications/:id/read - mark single notification as read */
notifications.post('/:id/read', async (c) => {
  const userId = c.get('userId')
  const id = parseInt(c.req.param('id'), 10)
  await c.env.DB.prepare(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`).bind(id, userId).run()
  return c.json({ success: true })
})

/** POST /api/notifications/read-all */
notifications.post('/read-all', async (c) => {
  const userId = c.get('userId')
  await c.env.DB.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`).bind(userId).run()
  return c.json({ success: true })
})

export default notifications
