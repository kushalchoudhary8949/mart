import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { generateOtp } from '../utils/helpers';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../utils/constants';

// ─── Redis Key Helpers ───────────────────────────────────────────────────────

const OTP_KEY = (phone: string) => `otp:${phone}`;
const ATTEMPTS_KEY = (phone: string) => `otp_attempts:${phone}`;

// ─── Constants ───────────────────────────────────────────────────────────────

const OTP_TTL = 300; // 5 minutes
const MAX_ATTEMPTS = 5;

// ─── OTP Service ─────────────────────────────────────────────────────────────

/**
 * Generates a secure 6-digit OTP and stores it in Redis for five minutes.
 * Any previous OTP for the phone number is removed before the new code is saved,
 * ensuring that only one code can be active at a time.
 *
 * @returns The generated OTP code (for debug purposes in dev).
 */
export async function createOtp(phone: string): Promise<string> {
  // 1. Generate a cryptographically secure six-digit OTP.
  const code = generateOtp(6);

  // 2. Replace any prior OTP atomically, including its verification attempts.
  // Redis serializes MULTI/EXEC transactions, so concurrent requests still leave
  // exactly one active code for this phone number.
  await redis
    .multi()
    .del(OTP_KEY(phone), ATTEMPTS_KEY(phone))
    .set(OTP_KEY(phone), code, 'EX', OTP_TTL)
    .set(ATTEMPTS_KEY(phone), '0', 'EX', OTP_TTL)
    .exec();

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
  const result = await redis.eval(
    `
      local storedOtp = redis.call('GET', KEYS[1])
      if not storedOtp then
        return -1
      end

      local attempts = tonumber(redis.call('GET', KEYS[2]) or '0')
      if attempts >= tonumber(ARGV[2]) then
        redis.call('DEL', KEYS[1], KEYS[2])
        return -2
      end

      if storedOtp ~= ARGV[1] then
        attempts = redis.call('INCR', KEYS[2])
        if attempts >= tonumber(ARGV[2]) then
          redis.call('DEL', KEYS[1], KEYS[2])
          return -2
        end
        return attempts
      end

      redis.call('DEL', KEYS[1], KEYS[2])
      return 0
    `,
    2,
    OTP_KEY(phone),
    ATTEMPTS_KEY(phone),
    code,
    String(MAX_ATTEMPTS)
  ) as number;

  if (result === -1) {
    throw new AppError(
      'OTP has expired or was not requested. Please request a new one.',
      HTTP_STATUS.GONE
    );
  }

  if (result === -2) {
    throw new AppError(
      'Maximum OTP verification attempts exceeded. Please request a new OTP.',
      HTTP_STATUS.TOO_MANY_REQUESTS
    );
  }

  if (result > 0) {
    const remaining = MAX_ATTEMPTS - result;
    throw new AppError(
      `Invalid OTP. ${remaining} attempt(s) remaining.`,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  logger.info(`OTP verified for phone: ${phone.slice(-4).padStart(10, '*')}`);
  return true;
}

/**
 * Removes all OTP-related keys for a phone number.
 */
