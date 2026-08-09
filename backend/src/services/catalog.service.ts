import { redis } from '../config/redis';
import * as categoryRepo from '../repositories/category.repository';
import * as productRepo from '../repositories/product.repository';
import * as bannerRepo from '../repositories/banner.repository';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../utils/constants';

// ─── Public Categories ───────────────────────────────────────────────────────

export async function getCategories() {
  try {
    const cached = await redis.get('cache:categories');
    if (cached) return JSON.parse(cached);
  } catch {}
  const categories = await categoryRepo.findAll();
  const result = { categories };
  try { await redis.set('cache:categories', JSON.stringify(result), 'EX', 60); } catch {}
  return result;
}

export async function getCategoryDetail(slug: string) {
  const category = await categoryRepo.findBySlug(slug);
  if (!category) {
    throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
  }
  return { category };
}

// ─── Public Banners ──────────────────────────────────────────────────────────

export async function getActiveBanners() {
  try {
    const cached = await redis.get('cache:banners');
    if (cached) return JSON.parse(cached);
  } catch {}
  const banners = await bannerRepo.findActive();
  const result = { banners };
  try { await redis.set('cache:banners', JSON.stringify(result), 'EX', 60); } catch {}
  return result;
}

// ─── Public Products ─────────────────────────────────────────────────────────

export async function queryProducts(filters: {
  q?: string;
  category?: string;
  featured?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'name' | 'newest';
  page?: number;
  limit?: number;
}) {
  const { q, category, featured, sort, page = 1, limit = 20 } = filters;
  const cacheKey = `cache:products:${q || ''}:${category || ''}:${Boolean(featured)}:${sort || ''}:${page}:${limit}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {}

  const { products, total } = await productRepo.findMany({
    q,
    categorySlug: category,
    featured,
    activeOnly: true,
    sort,
    page,
    limit,
  });

  // Map to fit frontend format
  const mappedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    mrp: p.mrp,
    unit: p.unit,
    image: p.thumbnail ?? p.images?.[0]?.url ?? null,
    stock: p.stock,
    rating: p.rating,
    rating_count: p.ratingCount,
    is_featured: p.isFeatured ? 1 : 0,
    category_name: p.category.name,
    category_slug: p.category.slug,
  }));

  const result = {
    products: mappedProducts,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
  try { await redis.set(cacheKey, JSON.stringify(result), 'EX', 30); } catch {}
  return result;
}

export async function getProductDetail(slug: string) {
  const product = await productRepo.findBySlug(slug, true);
  if (!product) {
    throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
  }

  // Related products from same category
  const relatedRaw = await productRepo.findRelated(product.categoryId, product.id, 8);
  const related = relatedRaw.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    mrp: p.mrp,
    unit: p.unit,
    image: p.thumbnail ?? p.images?.[0]?.url ?? null,
    rating: p.rating,
  }));

  // Flatten gallery urls
  const images = product.images.length > 0
    ? product.images.map((img) => img.url)
    : product.thumbnail ? [product.thumbnail] : [];

  return {
    product: {
      id: product.id,
      category_id: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      mrp: product.mrp,
      unit: product.unit,
      image: product.thumbnail ?? null,
      stock: product.stock,
      rating: product.rating,
      rating_count: product.ratingCount,
      is_featured: product.isFeatured ? 1 : 0,
      is_active: product.isActive ? 1 : 0,
      created_at: product.createdAt,
      category_name: product.category.name,
      category_slug: product.category.slug,
      images,
    },
    related,
  };
}

export async function getProductImageGallery(productId: number) {
  const product = await productRepo.findById(productId);
  if (!product || !product.isActive) {
    throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
  }

  const images = product.images.length > 0
    ? product.images.map((img) => img.url)
    : product.thumbnail ? [product.thumbnail] : [];

  return { images };
}
