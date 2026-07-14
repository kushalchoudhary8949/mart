import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { loginAttemptLimiter, otpRequestLimiter } from '../middlewares/rateLimiter';
import {
  otpRequestSchema,
  otpVerifySchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from '../validators/auth.validator';
import {
  otpRequest,
  otpVerify,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  updateProfile,
} from '../controllers/auth.controller';

const router = Router();

// ─── Public Routes ───────────────────────────────────────────────────────────

// Customer OTP flow
router.post('/send-otp', otpRequestLimiter, validate(otpRequestSchema), otpRequest);

// Backwards-compatible alias for existing clients.
router.post('/otp/request', otpRequestLimiter, validate(otpRequestSchema), otpRequest);
router.post('/verify-otp', otpRequestLimiter, validate(otpVerifySchema), otpVerify);
router.post('/otp/verify', otpRequestLimiter, validate(otpVerifySchema), otpVerify);

// Admin credentials login
router.post('/login', loginAttemptLimiter, validate(loginSchema), login);

// Token refresh (public — uses refresh token, not access token)
router.post('/refresh', validate(refreshSchema), refresh);

// ─── Protected Routes ───────────────────────────────────────────────────────

// Logout (single session)
router.post('/logout', authenticate, validate(logoutSchema), logout);

// Logout all sessions
router.post('/logout-all', authenticate, logoutAll);

// Get current user profile
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;
