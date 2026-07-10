import { Hono } from 'hono'
import type { AppEnv } from '../types'

const products = new Hono<AppEnv>()

/** GET /api/categories - list all categories */
products.get('/categories', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, name, slug, icon, image FROM categories ORDER BY sort_order ASC`
  ).all()
  return c.json({ categories: results })
})

/** GET /api/categories/:slug - category detail */
products.get('/categories/:slug', async (c) => {
  const slug = c.req.param('slug')
  const category = await c.env.DB.prepare(`SELECT * FROM categories WHERE slug = ?`).bind(slug).first()
  if (!category) return c.json({ error: 'Category not found' }, 404)
  return c.json({ category })
})

/**
 * GET /api/products
 * Query params: q (search), category (slug), featured (1), sort (price_asc|price_desc|rating|name),
 * page, limit
 */
products.get('/products', async (c) => {
  const q = c.req.query('q')?.trim()
  const categorySlug = c.req.query('category')?.trim()
  const featured = c.req.query('featured')
  const sort = c.req.query('sort') || 'name'
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '20', 10)))
  const offset = (page - 1) * limit

  const conditions: string[] = []
  const params: any[] = []

  if (categorySlug) {
    conditions.push(`p.category_id = (SELECT id FROM categories WHERE slug = ?)`)
    params.push(categorySlug)
  }
  if (q) {
    conditions.push(`(p.name LIKE ? OR p.description LIKE ?)`)
    params.push(`%${q}%`, `%${q}%`)
  }
  if (featured === '1') {
    conditions.push(`p.is_featured = 1`)
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const sortMap: Record<string, string> = {
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    rating: 'p.rating DESC',
    name: 'p.name ASC',
    newest: 'p.created_at DESC'
  }
  const orderBy = sortMap[sort] || sortMap.name

  const countRow = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM products p ${whereClause}`
  )
    .bind(...params)
    .first<{ total: number }>()

  const { results } = await c.env.DB.prepare(
    `SELECT p.id, p.name, p.slug, p.price, p.mrp, p.unit, p.image, p.stock, p.rating, p.rating_count, p.is_featured,
            c.name as category_name, c.slug as category_slug
     FROM products p
     JOIN categories c ON c.id = p.category_id
     ${whereClause}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`
  )
    .bind(...params, limit, offset)
    .all()

  return c.json({
    products: results,
    pagination: {
      page,
      limit,
      total: countRow?.total || 0,
      total_pages: Math.ceil((countRow?.total || 0) / limit)
    }
  })
})

/** GET /api/products/:slug - product detail */
products.get('/products/:slug', async (c) => {
  const slug = c.req.param('slug')
  const product = await c.env.DB.prepare(
    `SELECT p.*, c.name as category_name, c.slug as category_slug
     FROM products p JOIN categories c ON c.id = p.category_id
     WHERE p.slug = ?`
  )
    .bind(slug)
    .first()

  if (!product) return c.json({ error: 'Product not found' }, 404)

  // Related products from same category
  const { results: related } = await c.env.DB.prepare(
    `SELECT id, name, slug, price, mrp, unit, image, rating FROM products
     WHERE category_id = ? AND id != ? LIMIT 8`
  )
    .bind((product as any).category_id, (product as any).id)
    .all()

  return c.json({ product, related })
})

export default products
