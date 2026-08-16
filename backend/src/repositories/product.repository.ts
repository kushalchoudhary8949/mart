import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export interface ProductQueryFilters {
  q?: string;
  categorySlug?: string;
  featured?: boolean;
  activeOnly?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'name' | 'newest';
  page?: number;
  limit?: number;
}

/**
 * Find products with filters, search, pagination, and sorting.
 */
export async function findMany(filters: ProductQueryFilters) {
  const {
    q,
    categorySlug,
    featured,
    activeOnly = true,
    sort = 'name',
    page = 1,
    limit = 20,
  } = filters;

  const offset = (page - 1) * limit;

  // Build prisma search conditions
  const where: Prisma.ProductWhereInput = {};

  if (activeOnly) {
    where.isActive = true;
  }

  if (featured !== undefined) {
    where.isFeatured = featured;
  }

  if (categorySlug) {
    where.category = {
      slug: categorySlug,
    };
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  // Build sorting order
  let orderBy: Prisma.ProductOrderByWithRelationInput = { name: 'asc' };
  if (sort === 'price_asc') {
    orderBy = { price: 'asc' };
  } else if (sort === 'price_desc') {
    orderBy = { price: 'desc' };
  } else if (sort === 'rating') {
    orderBy = { rating: 'desc' };
  } else if (sort === 'newest') {
    orderBy = { createdAt: 'desc' };
  } else if (sort === 'name') {
    orderBy = { name: 'asc' };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          select: { url: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
  };
}

/**
 * Find all products (admin utility) with category details, descending by ID.
 */
export async function findAllAdmin() {
  return prisma.product.findMany({
    orderBy: { id: 'desc' },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      images: {
        orderBy: { sortOrder: 'asc' },
        select: { url: true },
      },
    },
  });
}

/**
 * Find a product by its slug (includes category and gallery images).
 */
export async function findBySlug(slug: string, activeOnly = true) {
  const isNumeric = /^\d+$/.test(slug);
  const where: Prisma.ProductWhereInput = {
    OR: [
      { slug },
      ...(isNumeric ? [{ id: Number(slug) }] : []),
    ],
  };
  if (activeOnly) {
    where.isActive = true;
  }

  return prisma.product.findFirst({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: { sortOrder: 'asc' },
        select: { url: true },
      },
    },
  });
}

/**
 * Find a product by ID.
 */
export async function findById(id: number) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
}

/**
 * Get related products (same category, different product ID).
 */
export async function findRelated(categoryId: number, excludeProductId: number, limit = 8) {
  return prisma.product.findMany({
    where: {
      categoryId,
      id: { not: excludeProductId },
      isActive: true,
    },
    take: limit,
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
        select: { url: true },
      },
    },
  });
}

/**
 * Create a new product (admin).
 */
export async function create(data: {
  categoryId: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  mrp: number;
  unit: string;
  thumbnail?: string | null;
  stock?: number;
  isFeatured?: boolean;
}) {
  return prisma.product.create({
    data,
  });
}

/**
 * Update product details (admin).
 */
export async function update(
  id: number,
  data: {
    categoryId?: number;
    name?: string;
    slug?: string;
    description?: string | null;
    price?: number;
    mrp?: number;
    unit?: string;
    thumbnail?: string | null;
    stock?: number;
    isFeatured?: boolean;
    isActive?: boolean;
  }
) {
  return prisma.product.update({
    where: { id },
    data,
  });
}

/**
 * Soft delete/deactivate a product.
 */
export async function deactivate(id: number) {
  return prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
}
