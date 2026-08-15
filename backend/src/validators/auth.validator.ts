import { z } from 'zod';

// ─── Phone Validation (Indian 10-digit mobile) ──────────────────────────────

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Invalid phone number. Must be a 10-digit Indian mobile number.');

// ─── Customer Direct Login Schema (Name + Phone, No OTP) ───────────────────

export const customerLoginSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name is required and must be at least 2 characters.')
    .max(100, 'Name must be 100 characters or less.'),
  phone: phoneSchema,
});

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
  name: z.string().trim().max(100).optional(),
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
  refreshToken: z.string().min(1, 'Refresh token is required.').optional(),
});

// ─── Profile Update Schema ─────────────────────────────────────────────────

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').optional(),
  email: z.string().trim().email('Invalid email address.').optional().or(z.literal('')),
  address: z.string().trim().min(1, 'Address is required.').optional(),
});
