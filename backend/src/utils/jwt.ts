import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

// ─── Payload Types ───────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  userId: number;
  phone: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: number;
  tokenId: number;
}

// ─── Sign ────────────────────────────────────────────────────────────────────

/**
 * Signs a short-lived access token (15m by default).
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiration as any,
  };
  return jwt.sign(payload, config.jwt.accessSecret, options);
}

/**
 * Signs a long-lived refresh token (7d by default).
 */
export function signRefreshToken(payload: RefreshTokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiration as any,
  };
  return jwt.sign(payload, config.jwt.refreshSecret, options);
}

// ─── Verify ──────────────────────────────────────────────────────────────────

/**
 * Verifies and decodes an access token.
 * Throws if expired or invalid.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
}

/**
 * Verifies and decodes a refresh token.
 * Throws if expired or invalid.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
}
