import { z } from 'zod';

// ─── Phone Validation (Indian 10-digit mobile) ──────────────────────────────

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Invalid phone number. Must be a 10-digit Indian mobile number.');

// ─── OTP Request Schema ─────────────────────────────────────────────────────

export const otpRequestSchema = z.object({
  phone: phoneSchema,
});

// ─── OTP Verify Schema ──────────────────────────────────────────────────────

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  code: z
    .string()
    .trim()
    .length(6, 'OTP must be exactly 6 digits.')
    .regex(/^\d{6}$/, 'OTP must contain only digits.'),
  name: z.string().trim().min(2).max(100).optional(),
});

// ─── Admin Login Schema ─────────────────────────────────────────────────────

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.'),
});

// ─── Refresh Token Schema ───────────────────────────────────────────────────

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required.'),
});

// ─── Logout Schema ──────────────────────────────────────────────────────────

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required.'),
});
