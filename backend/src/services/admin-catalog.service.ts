import * as categoryRepo from '../repositories/category.repository';
import * as productRepo from '../repositories/product.repository';
import * as bannerRepo from '../repositories/banner.repository';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../utils/constants';

// ─── Admin Categories CRUD ───────────────────────────────────────────────────

export async function getAdminCategories() {
  const categories = await categoryRepo.findAll();
  return { categories };
}

export async function createCategory(data: {
  name: string;
  slug: string;
  icon?: string | null;
  image?: string | null;
  sort_order?: number;
}) {
  const existing = await categoryRepo.findBySlug(data.slug);
  if (existing) {
    throw new AppError('Category slug already exists.', HTTP_STATUS.CONFLICT);
  }

  const category = await categoryRepo.create({
    name: data.name,
    slug: data.slug,
    icon: data.icon,
    image: data.image,
    sortOrder: data.sort_order,
  });

  return { success: true, id: category.id };
}

export async function updateCategory(
  id: number,
  data: {
    name?: string;
    slug?: string;
    icon?: string | null;
    image?: string | null;
    sort_order?: number;
  }
) {
  const category = await categoryRepo.findById(id);
  if (!category) {
    throw new AppError('Category not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (data.slug && data.slug !== category.slug) {
    const existing = await categoryRepo.findBySlug(data.slug);
    if (existing) {
      throw new AppError('Category slug already exists.', HTTP_STATUS.CONFLICT);
    }
  }

  await categoryRepo.update(id, {
    name: data.name,
    slug: data.slug,
    icon: data.icon,
    image: data.image,
    sortOrder: data.sort_order,
  });

  return { success: true };
}

export async function deleteCategory(id: number) {
  const category = await categoryRepo.findById(id);
  if (!category) {
    throw new AppError('Category not found.', HTTP_STATUS.NOT_FOUND);
  }

  await categoryRepo.remove(id);
  return { success: true };
}

// ─── Admin Products CRUD ─────────────────────────────────────────────────────

export async function getAdminProducts() {
  const products = await productRepo.findAllAdmin();

  // Map to fit frontend shape
  const mapped = products.map((p) => ({
    id: p.id,
    category_id: p.categoryId,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    mrp: p.mrp,
    unit: p.unit,
    image: p.image,
    stock: p.stock,
    rating: p.rating,
    rating_count: p.ratingCount,
    is_featured: p.isFeatured ? 1 : 0,
    is_active: p.isActive ? 1 : 0,
    created_at: p.createdAt,
    category_name: p.category.name,
  }));

  return { products: mapped };
}

export async function createProduct(data: {
  category_id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  mrp: number;
  unit: string;
  image?: string | null;
  stock?: number;
  is_featured?: boolean;
}) {
  // Validate category exists
  const category = await categoryRepo.findById(data.category_id);
  if (!category) {
    throw new AppError('Category not found.', HTTP_STATUS.BAD_REQUEST);
  }

  // Validate slug unique
  const existing = await productRepo.findBySlug(data.slug, false);
  if (existing) {
    throw new AppError('Product slug already exists.', HTTP_STATUS.CONFLICT);
  }

  const product = await productRepo.create({
    categoryId: data.category_id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    price: data.price,
    mrp: data.mrp,
    unit: data.unit,
    image: data.image,
    stock: data.stock,
    isFeatured: data.is_featured,
  });

  return { success: true, id: product.id };
}

export async function updateProduct(
  id: number,
  data: {
    category_id?: number;
    name?: string;
    slug?: string;
    description?: string | null;
    price?: number;
    mrp?: number;
    unit?: string;
    image?: string | null;
    stock?: number;
    is_featured?: boolean;
    is_active?: boolean;
  }
) {
  const product = await productRepo.findById(id);
  if (!product) {
    throw new AppError('Product not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (data.category_id) {
    const category = await categoryRepo.findById(data.category_id);
    if (!category) {
      throw new AppError('Category not found.', HTTP_STATUS.BAD_REQUEST);
    }
  }

  if (data.slug && data.slug !== product.slug) {
    const existing = await productRepo.findBySlug(data.slug, false);
    if (existing) {
      throw new AppError('Product slug already exists.', HTTP_STATUS.CONFLICT);
    }
  }

  const nextPrice = data.price ?? product.price;
  const nextMrp = data.mrp ?? product.mrp;
  if (nextMrp < nextPrice) {
    throw new AppError('MRP must be greater than or equal to selling price.', HTTP_STATUS.BAD_REQUEST);
  }

  await productRepo.update(id, {
    categoryId: data.category_id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    price: data.price,
    mrp: data.mrp,
    unit: data.unit,
    image: data.image,
    stock: data.stock,
    isFeatured: data.is_featured,
    isActive: data.is_active,
  });

  return { success: true };
}

export async function deactivateProduct(id: number) {
  const product = await productRepo.findById(id);
  if (!product) {
    throw new AppError('Product not found.', HTTP_STATUS.NOT_FOUND);
  }

  await productRepo.deactivate(id);
  return { success: true, message: 'Product deactivated' };
}

// ─── Admin Banners CRUD ──────────────────────────────────────────────────────

export async function getAdminBanners() {
  const banners = await bannerRepo.findAll();
  return { banners };
}

export async function createBanner(data: {
  title: string;
  subtitle?: string | null;
  image: string;
  cta_text?: string;
  cta_link?: string;
  active?: boolean;
  sort_order?: number;
  expires_at?: Date | null;
}) {
  const banner = await bannerRepo.create({
    title: data.title,
    subtitle: data.subtitle,
    image: data.image,
    ctaText: data.cta_text,
    ctaLink: data.cta_link,
    isActive: data.active,
    sortOrder: data.sort_order,
    expiresAt: data.expires_at,
  });

  return { success: true, id: banner.id };
}

export async function updateBanner(
  id: number,
  data: {
    title?: string;
    subtitle?: string | null;
    image?: string;
    cta_text?: string;
    cta_link?: string;
    active?: boolean;
    sort_order?: number;
    expires_at?: Date | null;
  }
) {
  const banner = await bannerRepo.findById(id);
  if (!banner) {
    throw new AppError('Banner not found.', HTTP_STATUS.NOT_FOUND);
  }

  await bannerRepo.update(id, {
    title: data.title,
    subtitle: data.subtitle,
    image: data.image,
    ctaText: data.cta_text,
    ctaLink: data.cta_link,
    isActive: data.active,
    sortOrder: data.sort_order,
    expiresAt: data.expires_at,
  });

  return { success: true };
}

export async function deleteBanner(id: number) {
  const banner = await bannerRepo.findById(id);
  if (!banner) {
    throw new AppError('Banner not found.', HTTP_STATUS.NOT_FOUND);
  }

  await bannerRepo.remove(id);
  return { success: true };
}
