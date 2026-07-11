import { prisma } from '../config/database';
import { Role } from '@prisma/client';

// ─── User Repository ─────────────────────────────────────────────────────────

/**
 * Find a user by phone number.
 */
export async function findByPhone(phone: string) {
  return prisma.user.findUnique({ where: { phone } });
}

/**
 * Find a user by ID.
 */
export async function findById(id: number) {
  return prisma.user.findUnique({ where: { id } });
}

/**
 * Find or create a user by phone number (used during OTP verification).
 * If the user exists, returns the existing record.
 * If not, creates a new CUSTOMER user.
 */
export async function findOrCreateByPhone(
  phone: string,
  name?: string
) {
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      phone,
      name: name || null,
      role: Role.CUSTOMER,
    },
  });
}

/**
 * Find a user by phone and specific role (used for admin login).
 */
export async function findByPhoneAndRole(phone: string, role: Role) {
  return prisma.user.findFirst({
    where: { phone, role },
  });
}

/**
 * Update a user's password hash.
 */
export async function updatePasswordHash(userId: number, passwordHash: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

/**
 * Update a user's profile fields.
 */
export async function updateProfile(
  userId: number,
  data: { name?: string; email?: string }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}
