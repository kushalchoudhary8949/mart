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
 * Creates a CUSTOMER user when the phone is new, or marks the existing user
 * as verified after a successful OTP check.
 */
export async function findOrCreateVerifiedByPhone(phone: string) {
  return prisma.user.upsert({
    where: { phone },
    create: {
      phone,
      role: Role.CUSTOMER,
      isVerified: true,
    },
    update: {
      isVerified: true,
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
