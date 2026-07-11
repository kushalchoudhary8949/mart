import { prisma } from '../config/database';

/**
 * Fetch all active banners that haven't expired yet, sorted by sortOrder.
 */
export async function findActive() {
  const now = new Date();
  return prisma.banner.findMany({
    where: {
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: now } },
      ],
    },
    orderBy: { sortOrder: 'asc' },
  });
}

/**
 * Fetch all banners (admin list).
 */
export async function findAll() {
  return prisma.banner.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

/**
 * Find a banner by ID.
 */
export async function findById(id: number) {
  return prisma.banner.findUnique({
    where: { id },
  });
}

/**
 * Create a new banner (admin).
 */
export async function create(data: {
  title: string;
  subtitle?: string | null;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  isActive?: boolean;
  sortOrder?: number;
  expiresAt?: Date | null;
}) {
  return prisma.banner.create({
    data,
  });
}

/**
 * Update a banner (admin).
 */
export async function update(
  id: number,
  data: {
    title?: string;
    subtitle?: string | null;
    image?: string;
    ctaText?: string;
    ctaLink?: string;
    isActive?: boolean;
    sortOrder?: number;
    expiresAt?: Date | null;
  }
) {
  return prisma.banner.update({
    where: { id },
    data,
  });
}

/**
 * Delete a banner (admin).
 */
export async function remove(id: number) {
  return prisma.banner.delete({
    where: { id },
  });
}
