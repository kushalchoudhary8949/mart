import { prisma } from '../config/database';

/**
 * Fetch all categories ordered by sortOrder ascending.
 */
export async function findAll() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

/**
 * Find a category by its slug.
 */
export async function findBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
  });
}

/**
 * Find a category by its id.
 */
export async function findById(id: number) {
  return prisma.category.findUnique({
    where: { id },
  });
}

/**
 * Create a new category (admin).
 */
export async function create(data: {
  name: string;
  slug: string;
  icon?: string | null;
  image?: string | null;
  sortOrder?: number;
}) {
  return prisma.category.create({
    data,
  });
}

/**
 * Update a category (admin).
 */
export async function update(
  id: number,
  data: {
    name?: string;
    slug?: string;
    icon?: string | null;
    image?: string | null;
    sortOrder?: number;
  }
) {
  return prisma.category.update({
    where: { id },
    data,
  });
}

/**
 * Delete a category (admin).
 */
export async function remove(id: number) {
  return prisma.category.delete({
    where: { id },
  });
}
