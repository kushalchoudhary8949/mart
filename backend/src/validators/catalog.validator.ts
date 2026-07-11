import { z } from 'zod';

// ─── Query Parameters Schema (Public Product List) ─────────────────────────

export const productQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  featured: z
    .enum(['1', '0', 'true', 'false'])
    .optional()
    .transform((value) => value === undefined ? undefined : value === '1' || value === 'true'),
  sort: z.enum(['price_asc', 'price_desc', 'rating', 'name', 'newest']).default('name'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ─── Category Validators (Admin) ─────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens.'),
  icon: z.string().trim().max(100).optional().nullable(),
  image: z.string().trim().url('Invalid image URL.').optional().nullable(),
  sort_order: z.number().int().nonnegative().optional().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

// ─── Product Validators (Admin) ─────────────────────────────────────────────

export const createProductSchema = z.object({
  category_id: z.number().int().positive('Category ID must be positive.'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(150),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens.'),
  description: z.string().trim().max(1000).optional().nullable(),
  price: z.number().positive('Price must be greater than zero.'),
  mrp: z.number().positive('MRP must be greater than zero.'),
  unit: z.string().trim().min(1, 'Unit description is required (e.g. 1 kg, 500 ml).').max(50),
  image: z.string().trim().url('Invalid image URL.').optional().nullable(),
  stock: z.number().int().nonnegative('Stock cannot be negative.').optional().default(100),
  is_featured: z.boolean().optional().default(false),
}).refine((data) => data.mrp >= data.price, {
  message: 'MRP must be greater than or equal to selling price.',
  path: ['mrp'],
});

export const updateProductSchema = z.object({
  category_id: z.number().int().positive().optional(),
  name: z.string().trim().min(2).max(150).optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens.')
    .optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  price: z.number().positive().optional(),
  mrp: z.number().positive().optional(),
  unit: z.string().trim().min(1).max(50).optional(),
  image: z.string().trim().url().optional().nullable(),
  stock: z.number().int().nonnegative().optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
}).refine((data) => {
  if (data.mrp !== undefined && data.price !== undefined) {
    return data.mrp >= data.price;
  }
  return true;
}, {
  message: 'MRP must be greater than or equal to selling price.',
  path: ['mrp'],
});

// ─── Banner Validators (Admin) ───────────────────────────────────────────────

export const createBannerSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters.').max(150),
  subtitle: z.string().trim().max(250).optional().nullable(),
  image: z.string().trim().url('Invalid image URL.'),
  cta_text: z.string().trim().max(50).optional().default('Shop Now'),
  cta_link: z.string().trim().max(250).optional().default('/categories'),
  active: z.boolean().optional().default(true),
  sort_order: z.number().int().nonnegative().optional().default(0),
  expires_at: z
    .string()
    .datetime('Invalid date format. Expected ISO-8601.')
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
});

export const updateBannerSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  subtitle: z.string().trim().max(250).optional().nullable(),
  image: z.string().trim().url().optional(),
  cta_text: z.string().trim().max(50).optional(),
  cta_link: z.string().trim().max(250).optional(),
  active: z.boolean().optional(),
  sort_order: z.number().int().nonnegative().optional(),
  expires_at: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
});
