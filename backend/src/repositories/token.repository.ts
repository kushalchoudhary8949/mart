import { prisma } from '../config/database';

// ─── Token Repository ────────────────────────────────────────────────────────

/**
 * Creates a new refresh token record in the database.
 */
export async function createRefreshToken(data: {
  token: string;
  userId: number;
  expiresAt: Date;
}) {
  return prisma.refreshToken.create({ data });
}

/**
 * Finds a refresh token by its token string.
 */
export async function findByToken(token: string) {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });
}

/**
 * Revokes a refresh token by ID.
 */
export async function revokeById(id: number) {
  return prisma.refreshToken.update({
    where: { id },
    data: { revoked: true },
  });
}

/**
 * Revokes a single refresh token by its token string.
 */
export async function revokeToken(token: string) {
  return prisma.refreshToken.update({
    where: { token },
    data: { revoked: true },
  });
}

/**
 * Revokes ALL refresh tokens for a given user.
 * Used during token-theft detection or logout-all.
 */
export async function revokeAllUserTokens(userId: number) {
  return prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}

/**
 * Deletes expired or revoked tokens for cleanup (optional maintenance).
 */
export async function deleteExpiredTokens() {
  return prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revoked: true },
      ],
    },
  });
}
