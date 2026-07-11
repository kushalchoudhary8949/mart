import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { requireAuth } from '../middlewares/auth';
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
} from '../controllers/auth.controller';

const router = Router();

// ─── Public Routes ───────────────────────────────────────────────────────────

// Customer OTP flow
router.post('/otp/request', validate(otpRequestSchema), otpRequest);
router.post('/otp/verify', validate(otpVerifySchema), otpVerify);

// Admin credentials login
router.post('/login', validate(loginSchema), login);

// Token refresh (public — uses refresh token, not access token)
router.post('/refresh', validate(refreshSchema), refresh);

// ─── Protected Routes ───────────────────────────────────────────────────────

// Logout (single session)
router.post('/logout', requireAuth, validate(logoutSchema), logout);

// Logout all sessions
router.post('/logout-all', requireAuth, logoutAll);

// Get current user profile
router.get('/me', requireAuth, getMe);

export default router;
