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
 * Marks a refresh token as used (consumed during rotation).
 */
export async function markAsUsed(id: number, replacedBy: string) {
  return prisma.refreshToken.update({
    where: { id },
    data: { isUsed: true, replacedBy },
  });
}

/**
 * Revokes a single refresh token by its token string.
 */
export async function revokeToken(token: string) {
  return prisma.refreshToken.update({
    where: { token },
    data: { isRevoked: true },
  });
}

/**
 * Revokes ALL refresh tokens for a given user.
 * Used during token-theft detection or logout-all.
 */
export async function revokeAllUserTokens(userId: number) {
  return prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
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
        { isRevoked: true },
      ],
    },
  });
}
