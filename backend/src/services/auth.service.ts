import { Role } from '@prisma/client';
import { config } from '../config';
import { logger } from '../config/logger';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../utils/constants';
import { normalizePhone } from '../utils/helpers';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { comparePassword } from '../utils/password';
import * as otpService from './otp.service';
import * as userRepo from '../repositories/user.repository';
import * as tokenRepo from '../repositories/token.repository';

// ─── Helper: Parse duration strings like "7d" or "15m" to milliseconds ──────

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
    data: { token: refreshToken, isUsed: false },
  });

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
    message: 'OTP sent successfully.',
    ...(isDev && { debug_otp: code }),
  };
}

// ─── OTP Verify (Customer Login/Signup) ──────────────────────────────────────

export async function verifyOtpAndLogin(phone: string, code: string, name?: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    throw new AppError('Invalid phone number.', HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Verify OTP in Redis
  await otpService.verifyOtp(normalized, code);

  // 2. Find or create user
  const user = await userRepo.findOrCreateByPhone(normalized, name);

  if (!user.isActive) {
    throw new AppError(
      'Your account has been deactivated. Contact support.',
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
      name: user.name,
      role: user.role,
    },
  };
}

// ─── Admin Login (Credentials) ──────────────────────────────────────────────

export async function loginWithCredentials(phone: string, password: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    throw new AppError('Invalid phone number.', HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Find admin user
  const user = await userRepo.findByPhoneAndRole(normalized, Role.ADMIN);
  if (!user || !user.passwordHash) {
    throw new AppError('Invalid credentials.', HTTP_STATUS.UNAUTHORIZED);
  }

  if (!user.isActive) {
    throw new AppError(
      'Your account has been deactivated. Contact support.',
      HTTP_STATUS.FORBIDDEN
    );
  }

  // 2. Verify password
  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid credentials.', HTTP_STATUS.UNAUTHORIZED);
  }

  // 3. Issue token pair
  const { accessToken, refreshToken } = await createTokenPair(user);

  logger.info(`Admin ${user.id} logged in via credentials.`);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    },
  };
}

// ─── Refresh Token Rotation ─────────────────────────────────────────────────

export async function refreshTokens(oldRefreshToken: string) {
  // 1. Verify JWT signature and expiry first
  try {
    verifyRefreshToken(oldRefreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token.', HTTP_STATUS.UNAUTHORIZED);
  }

  // 2. Find token record in DB
  const tokenRecord = await tokenRepo.findByToken(oldRefreshToken);
  if (!tokenRecord) {
    throw new AppError('Refresh token not found.', HTTP_STATUS.UNAUTHORIZED);
  }

  // 3. Check if token was already used (replay attack detection)
  if (tokenRecord.isUsed) {
    // Token theft detected — revoke ALL tokens for this user
    logger.warn(`🚨 Refresh token reuse detected for user ${tokenRecord.userId}. Revoking all tokens.`);
    await tokenRepo.revokeAllUserTokens(tokenRecord.userId);
    throw new AppError(
      'Suspicious activity detected. All sessions have been revoked. Please log in again.',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // 4. Check if token is revoked
  if (tokenRecord.isRevoked) {
    throw new AppError('Refresh token has been revoked.', HTTP_STATUS.UNAUTHORIZED);
  }

  // 5. Check if token is expired (DB-level check)
  if (tokenRecord.expiresAt < new Date()) {
    throw new AppError('Refresh token has expired.', HTTP_STATUS.UNAUTHORIZED);
  }

  // 6. Check user is still active
  const user = tokenRecord.user;
  if (!user || !user.isActive) {
    throw new AppError('User account is inactive.', HTTP_STATUS.FORBIDDEN);
  }

  // 7. Issue new token pair
  const { accessToken, refreshToken: newRefreshToken } = await createTokenPair(user);

  // 8. Mark old token as used, pointing to the new one
  await tokenRepo.markAsUsed(tokenRecord.id, newRefreshToken);

  logger.info(`Tokens rotated for user ${user.id}.`);

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
}

// ─── Logout (Single Session) ────────────────────────────────────────────────

export async function logout(refreshToken: string) {
  const tokenRecord = await tokenRepo.findByToken(refreshToken);
  if (tokenRecord && !tokenRecord.isRevoked) {
    await tokenRepo.revokeToken(refreshToken);
  }
  return { message: 'Logged out successfully.' };
}

// ─── Logout All Sessions ────────────────────────────────────────────────────

export async function logoutAll(userId: number) {
  await tokenRepo.revokeAllUserTokens(userId);
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
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}
