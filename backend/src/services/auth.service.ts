import { Role } from '@prisma/client';
import { config } from '../config';
import { logger } from '../config/logger';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../utils/constants';
import { normalizePhone } from '../utils/helpers';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { redis } from '../config/redis';
import * as otpService from './otp.service';
import * as userRepo from '../repositories/user.repository';
import * as tokenRepo from '../repositories/token.repository';
import { comparePassword } from '../utils/password';

// ─── Helper: Parse duration strings like "7d" or "15m" to milliseconds ──────

const SESSION_PREFIX = 'auth:session';

function parseDurationMs(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default: 7 days
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default:  return 7 * 24 * 60 * 60 * 1000;
  }
}

function getSessionKey(userId: number, tokenId: number): string {
  return `${SESSION_PREFIX}:${userId}:${tokenId}`;
}

async function persistSession(userId: number, tokenId: number, expiresAt: Date): Promise<void> {
  try {
    const ttlSeconds = Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000));
    await redis.set(getSessionKey(userId, tokenId), '1', 'EX', ttlSeconds);
  } catch (error) {
    logger.warn(`Unable to persist auth session for user ${userId}:`, error);
  }
}

async function deleteSession(userId: number, tokenId: number): Promise<void> {
  try {
    await redis.del(getSessionKey(userId, tokenId));
  } catch (error) {
    logger.warn(`Unable to delete auth session for user ${userId}:`, error);
  }
}

async function deleteAllSessions(userId: number): Promise<void> {
  try {
    const keys = await redis.keys(`${SESSION_PREFIX}:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.warn(`Unable to delete auth sessions for user ${userId}:`, error);
  }
}

async function hasSession(userId: number, tokenId: number): Promise<boolean> {
  try {
    const value = await redis.get(getSessionKey(userId, tokenId));
    return value === '1';
  } catch {
    return true;
  }
}

// ─── Token Pair Issuance ─────────────────────────────────────────────────────

async function createTokenPair(user: { id: number; phone: string; role: Role }) {
  const expiresAt = new Date(Date.now() + parseDurationMs(config.jwt.refreshExpiration));

  // We need the tokenId for the JWT payload, but we need the JWT for the DB record.
  // Solution: Create record first with a temporary token, get the ID, sign the JWT, then update.
  const tempRecord = await tokenRepo.createRefreshToken({
    token: `temp_${Date.now()}_${Math.random()}`,
    userId: user.id,
    expiresAt,
  });

  const accessToken = signAccessToken({
    userId: user.id,
    phone: user.phone,
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    userId: user.id,
    tokenId: tempRecord.id,
  });

  // Update the record with the actual signed token
  const { prisma } = await import('../config/database');
  await prisma.refreshToken.update({
    where: { id: tempRecord.id },
    data: { token: refreshToken },
  });

  await persistSession(user.id, tempRecord.id, expiresAt);

  return { accessToken, refreshToken };
}

// ─── OTP Request ─────────────────────────────────────────────────────────────

export async function requestOtp(phone: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    throw new AppError('Invalid phone number.', HTTP_STATUS.BAD_REQUEST);
  }

  const code = await otpService.createOtp(normalized);

  // In development, return the OTP for testing
  const isDev = config.env === 'development';

  return {
    message: 'OTP generated successfully.',
    ...(isDev && { mockOtp: code }),
  };
}

// ─── OTP Verify (Customer Login/Signup) ──────────────────────────────────────

export async function verifyOtpAndLogin(phone: string, code: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    throw new AppError('Invalid phone number.', HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Verify OTP in Redis
  await otpService.verifyOtp(normalized, code);

  // 2. Create a CUSTOMER user when needed, and mark existing users verified.
  const user = await userRepo.findOrCreateVerifiedByPhone(normalized);

  if (user.isBlocked) {
    throw new AppError(
      'Your account has been blocked. Contact support.',
      HTTP_STATUS.FORBIDDEN
    );
  }

  // 3. Issue token pair
  const { accessToken, refreshToken } = await createTokenPair(user);

  logger.info(`User ${user.id} logged in via OTP.`);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
    },
  };
}

// ─── Admin Login (Credentials) ──────────────────────────────────────────────

export async function loginWithCredentials(phone: string, password: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) throw new AppError('Invalid phone number.', HTTP_STATUS.BAD_REQUEST);
  const user = await userRepo.findByPhone(normalized);
  if (!user || !user.passwordHash || !(await comparePassword(password, user.passwordHash))) {
    throw new AppError('Invalid phone number or password.', HTTP_STATUS.UNAUTHORIZED);
  }
  if (user.isBlocked || !user.isActive) throw new AppError('This account is inactive.', HTTP_STATUS.FORBIDDEN);
  const tokens = await createTokenPair(user);
  return { ...tokens, user: { id: user.id, phone: user.phone, role: user.role, isVerified: user.isVerified } };
}

// ─── Refresh Token Rotation ─────────────────────────────────────────────────

export async function refreshTokens(oldRefreshToken: string) {
  // 1. Verify JWT signature and expiry first
  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token.', HTTP_STATUS.UNAUTHORIZED);
  }

  // 2. Find token record in DB
  const tokenRecord = await tokenRepo.findByToken(oldRefreshToken);
  if (!tokenRecord) {
    throw new AppError('Refresh token not found.', HTTP_STATUS.UNAUTHORIZED);
  }

  if (decoded.tokenId !== tokenRecord.id || decoded.userId !== tokenRecord.userId) {
    throw new AppError('Invalid refresh token.', HTTP_STATUS.UNAUTHORIZED);
  }

  // 3. Check if token is revoked
  if (tokenRecord.revoked) {
    throw new AppError('Refresh token has been revoked.', HTTP_STATUS.UNAUTHORIZED);
  }

  // 4. Check if token is expired (DB-level check)
  if (tokenRecord.expiresAt < new Date()) {
    throw new AppError('Refresh token has expired.', HTTP_STATUS.UNAUTHORIZED);
  }

  // 5. Check user is still eligible to authenticate.
  const user = tokenRecord.user;
  if (!user || user.isBlocked) {
    throw new AppError('User account is blocked.', HTTP_STATUS.FORBIDDEN);
  }

  // 6. Ensure the session is still active before rotating tokens.
  const sessionActive = await hasSession(user.id, tokenRecord.id);
  if (!sessionActive) {
    throw new AppError('Session has been invalidated.', HTTP_STATUS.UNAUTHORIZED);
  }

  // 7. Issue a new token pair and revoke the token it replaces.
  const { accessToken, refreshToken: newRefreshToken } = await createTokenPair(user);
  await deleteSession(user.id, tokenRecord.id);
  await tokenRepo.revokeById(tokenRecord.id);

  logger.info(`Tokens rotated for user ${user.id}.`);

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
}

// ─── Logout (Single Session) ────────────────────────────────────────────────

export async function logout(refreshToken?: string, userId?: number) {
  if (refreshToken) {
    const tokenRecord = await tokenRepo.findByToken(refreshToken);
    if (tokenRecord) {
      await deleteSession(tokenRecord.userId, tokenRecord.id);
      if (!tokenRecord.revoked) {
        await tokenRepo.revokeToken(refreshToken);
      }
    }
  } else if (userId) {
    await tokenRepo.revokeAllUserTokens(userId);
    await deleteAllSessions(userId);
  }

  return { message: 'Logged out successfully.' };
}

// ─── Logout All Sessions ────────────────────────────────────────────────────

export async function logoutAll(userId: number) {
  await tokenRepo.revokeAllUserTokens(userId);
  await deleteAllSessions(userId);
  logger.info(`All sessions revoked for user ${userId}.`);
  return { message: 'All sessions have been logged out.' };
}

// ─── Get Profile ─────────────────────────────────────────────────────────────

export async function getProfile(userId: number) {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
  }

  return {
    id: user.id,
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt,
  };
}
