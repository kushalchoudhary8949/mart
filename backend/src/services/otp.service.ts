import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { generateOtp } from '../utils/helpers';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../utils/constants';

// ─── Redis Key Helpers ───────────────────────────────────────────────────────

const OTP_KEY = (phone: string) => `otp:${phone}`;
const ATTEMPTS_KEY = (phone: string) => `otp_attempts:${phone}`;
const COOLDOWN_KEY = (phone: string) => `otp_cooldown:${phone}`;

// ─── Constants ───────────────────────────────────────────────────────────────

const OTP_TTL = 300; // 5 minutes
const COOLDOWN_TTL = 60; // 1 minute between OTP requests
const MAX_ATTEMPTS = 5;

// ─── OTP Service ─────────────────────────────────────────────────────────────

/**
 * Generates a 6-digit OTP and stores it in Redis with a 5-minute TTL.
 * Enforces a 60-second cooldown between requests per phone number.
 *
 * @returns The generated OTP code (for debug purposes in dev).
 */
export async function createOtp(phone: string): Promise<string> {
  // 1. Check cooldown — prevent spam
  const cooldown = await redis.get(COOLDOWN_KEY(phone));
  if (cooldown) {
    throw new AppError(
      'Please wait before requesting another OTP',
      HTTP_STATUS.TOO_MANY_REQUESTS
    );
  }

  // 2. Generate cryptographically secure OTP
  const code = generateOtp(6);

  // 3. Store OTP, reset attempts, set cooldown — all in a pipeline
  const pipeline = redis.pipeline();
  pipeline.set(OTP_KEY(phone), code, 'EX', OTP_TTL);
  pipeline.set(ATTEMPTS_KEY(phone), '0', 'EX', OTP_TTL);
  pipeline.set(COOLDOWN_KEY(phone), '1', 'EX', COOLDOWN_TTL);
  await pipeline.exec();

  logger.info(`OTP generated for phone: ${phone.slice(-4).padStart(10, '*')}`);
  return code;
}

/**
 * Verifies an OTP code against the stored value in Redis.
 * Enforces a maximum of 5 attempts. After 5 failures, the OTP is deleted.
 *
 * @returns true if verification succeeds.
 * @throws AppError on failure, expiry, or too many attempts.
 */
export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  // 1. Get stored OTP
  const storedOtp = await redis.get(OTP_KEY(phone));
  if (!storedOtp) {
    throw new AppError(
      'OTP has expired or was not requested. Please request a new one.',
      HTTP_STATUS.GONE
    );
  }

  // 2. Check attempt count
  const attempts = parseInt((await redis.get(ATTEMPTS_KEY(phone))) || '0', 10);
  if (attempts >= MAX_ATTEMPTS) {
    // Delete OTP keys — user must request a new one
    await deleteOtpKeys(phone);
    throw new AppError(
      'Maximum OTP verification attempts exceeded. Please request a new OTP.',
      HTTP_STATUS.TOO_MANY_REQUESTS
    );
  }

  // 3. Compare codes
  if (storedOtp !== code) {
    // Increment attempts
    await redis.incr(ATTEMPTS_KEY(phone));
    const remaining = MAX_ATTEMPTS - attempts - 1;
    throw new AppError(
      `Invalid OTP. ${remaining} attempt(s) remaining.`,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // 4. Success — clean up Redis keys
  await deleteOtpKeys(phone);
  logger.info(`OTP verified for phone: ${phone.slice(-4).padStart(10, '*')}`);
  return true;
}

/**
 * Removes all OTP-related keys for a phone number.
 */
async function deleteOtpKeys(phone: string): Promise<void> {
  await redis.del(OTP_KEY(phone), ATTEMPTS_KEY(phone), COOLDOWN_KEY(phone));
}
